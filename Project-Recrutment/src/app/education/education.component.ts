import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EducationService } from '../service/education.service';
import { ActivatedRoute, Router } from '@angular/router';

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

  constructor(
    private fb: FormBuilder,
    private educationService: EducationService,
    private router: Router,
    private route: ActivatedRoute
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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.id) {
      this.router.navigate(['/login']);
      return;
    }
    this.userId = user.id;

    this.educationId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.educationId) {
      this.isEditMode = true;
      this.loadEducationById(this.educationId);
    }
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
    if (this.educationForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly';
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
