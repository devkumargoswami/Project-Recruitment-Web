import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Experience } from './experience.model';
import { ExperienceService } from './experience.service';

@Component({
  selector: 'app-experience-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './experience-form.component.html',
  styleUrls: ['./experience-form.component.css']
})
export class ExperienceFormComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  editingId: number | null = null;
  isEditMode = false;
  currentUserId = 0;

  constructor(
    private fb: FormBuilder,
    private service: ExperienceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
    this.checkEditMode();
  }

  checkEditMode() {
    const editData = sessionStorage.getItem('editExperience');
    if (editData) {
      const experience = JSON.parse(editData);
      this.editingId = experience.id;
      this.isEditMode = true;
      this.form.patchValue(experience);
      sessionStorage.removeItem('editExperience');
    }
  }

  initForm() {
    this.form = this.fb.group({
      userId: [this.currentUserId, [Validators.required]],
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      designation: ['', [Validators.required, Validators.minLength(2)]],
      startDate: ['', Validators.required],
      endDate: [''],
      isCurrent: [false]
    });
  }

  get showEndDate() {
    return !this.form.get('isCurrent')?.value;
  }

  getError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (control?.hasError('required')) return `${fieldName} is required`;
    if (control?.hasError('minlength')) return `${fieldName} must be at least 2 characters`;
    return '';
  }

  onSubmit() {
    if (!this.form.valid) {
      alert('Please fill all required fields');
      return;
    }

    if (this.showEndDate && !this.form.get('endDate')?.value) {
      alert('Please provide end date for completed experiences');
      return;
    }

    this.isLoading = true;
    const formValue = this.form.value;

    if (this.editingId) {
      this.service.updateExperience(this.editingId, formValue).subscribe(
        (result) => {
          this.isLoading = false;
          alert('Experience updated successfully!');
          this.resetForm();
          this.router.navigate(['/experience/list']);
        },
        (error) => {
          this.isLoading = false;
          console.error('Error:', error);
          alert('Failed to update experience');
        }
      );
    } else {
      this.service.createExperience(formValue).subscribe(
        (result) => {
          this.isLoading = false;
          alert('Experience added successfully!');
          this.resetForm();
          this.router.navigate(['/experience/list']);
        },
        (error) => {
          this.isLoading = false;
          console.error('Error:', error);
          alert('Failed to create experience');
        }
      );
    }
  }

  resetForm() {
    this.form.reset();
    this.editingId = null;
    this.isEditMode = false;
  }

  onCancel() {
    this.resetForm();
    this.router.navigate(['/experience/list']);
  }

  goToList() {
    this.router.navigate(['/experience/list']);
  }
}