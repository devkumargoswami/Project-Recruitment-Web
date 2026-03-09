import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EducationService } from '../service/education.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService, UserProfile } from '../service/profile.service';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent implements OnInit {
  educationForm!: FormGroup;
  userId!: number;
  educationId: number | null = null;
  isEditMode = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  educationLevels = [
    { id: 1, name: 'SSC (10th)' },
    { id: 2, name: 'HSC (12th)' },
    { id: 3, name: 'UG (Bachelor)' },
    { id: 4, name: 'PG (Master)' },
    { id: 5, name: 'PhD' }
  ];

  constructor(
    private fb: FormBuilder,
    private educationService: EducationService,
    private router: Router,
    private route: ActivatedRoute,
    private profileService: ProfileService
  ) {
    this.educationForm = this.fb.group({
      educationLevelId: ['', Validators.required],
      schoolCollege: ['', Validators.required],
      boardUniversity: ['', Validators.required],
      degree: ['', Validators.required],
      startMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
      startYear: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      endMonth: [''],
      endYear: [''],
      isContinue: [false]
    });
  }

  ngOnInit(): void {
    // Auto-fill user ID from profile API
    this.loadUserIdFromProfile();

    this.educationId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.educationId) {
      this.isEditMode = true;
      this.loadEducationById(this.educationId);
    }
  }

  private loadUserIdFromProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (user: UserProfile) => {
        this.userId = user.id;
      },
      error: (error) => {
        console.error('Failed to load user profile:', error);
        // Fallback to session storage if API fails
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user?.id) {
            this.userId = user.id;
          }
        } catch (sessionError) {
          console.warn('Failed to load user from session:', sessionError);
        }
      }
    });
  }

  loadEducationById(id: number): void {
    this.educationService.getById(id).subscribe({
      next: (res: any) => this.educationForm.patchValue(res),
      error: () => this.errorMessage = 'Failed to load education record'
    });
  }

  onContinueChange(event: any): void {
    const isContinue = event.target.checked;
    if (isContinue) {
      this.educationForm.patchValue({ endMonth: '', endYear: '' });
    }
  }

  onSubmit(): void {
    // Check if all required fields are filled
    const formValue = this.educationForm.value;
    const requiredFields = [
      { name: 'Education Level', value: formValue.educationLevelId },
      { name: 'School/College', value: formValue.schoolCollege },
      { name: 'Board/University', value: formValue.boardUniversity },
      { name: 'Degree', value: formValue.degree },
      { name: 'Start Month', value: formValue.startMonth },
      { name: 'Start Year', value: formValue.startYear }
    ];

    // Check for empty required fields
    const emptyFields = requiredFields.filter(field => 
      !field.value || field.value.toString().trim() === ''
    );

    if (emptyFields.length > 0) {
      this.errorMessage = 'All fields are required';
      return;
    }

    // If not currently studying, check end date
    if (!formValue.isContinue) {
      if (!formValue.endMonth || !formValue.endYear || 
          formValue.endMonth.toString().trim() === '' || formValue.endYear.toString().trim() === '') {
        this.errorMessage = 'All fields are required';
        return;
      }
    }

    // Validate userId is not null or zero
    if (!this.userId || this.userId <= 0) {
      this.errorMessage = 'User ID is required';
      return;
    }

    // Final validation: ensure all form values are non-null and non-empty
    const allFormValues = Object.values(formValue);
    const hasNullValues = allFormValues.some(value => 
      value === null || value === undefined || value.toString().trim() === ''
    );

    if (hasNullValues) {
      this.errorMessage = 'All fields are required';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = { ...this.educationForm.value, userId: this.userId };

    if (this.isEditMode) {
      this.educationService.update(this.educationId!, payload).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Education updated successfully';
          setTimeout(() => this.router.navigate(['/dashboard']), 1500);
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Update failed';
        }
      });
    } else {
      this.educationService.insert(payload).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Education saved successfully';
          setTimeout(() => this.router.navigate(['/dashboard']), 1500);
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Save failed';
        }
      });
    }
  }
}