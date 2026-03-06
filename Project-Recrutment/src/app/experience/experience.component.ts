import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExperienceService } from './experience.service';
import { ExperienceModel } from './experience.model';

@Component({
  selector: 'app-experience',
  standalone: true,
  templateUrl: './experience-form.component.html',
  styleUrls: ['./experience-form.component.css'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class ExperienceComponent implements OnInit {
  experienceForm: FormGroup;
  submitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private experienceService: ExperienceService
  ) {
    this.experienceForm = this.fb.group({
      id: [0],
      userId: ['', [Validators.required, Validators.min(1)]],
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      designation: ['', [Validators.required, Validators.minLength(2)]],
      startDate: [''],
      endDate: [''],
      isCurrent: [false]
    });
  }

  ngOnInit(): void {
    console.log('=== EXPERIENCE COMPONENT INITIALIZED ===');
  }

  isFormValid(): boolean {
    const v = this.experienceForm.value;
    return !!(v.userId && v.companyName?.trim().length >= 2 &&
              v.designation?.trim().length >= 2 && v.startDate);
  }

  // ✅ ADD
  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in User ID, Company Name, Designation and Start Date';
      return;
    }

    this.submitting = true;

    const formData = {
      ...this.experienceForm.value,
      id: 0,
      endDate: this.experienceForm.value.isCurrent ? null : this.experienceForm.value.endDate
    };

    console.log('Inserting:', formData);

    this.experienceService.insertExperience(formData).subscribe({
      next: (response) => {
        console.log('Insert response:', response);
        this.submitting = false;
        this.successMessage = 'Experience added successfully!';
        this.resetForm();
      },
      error: (error) => {
        console.error('Insert error:', error);
        this.submitting = false;
        this.errorMessage = 'Error adding experience: ' + error.message;
      }
    });
  }

  // ✅ UPDATE - id → experienceId mapping
  onUpdate(): void {
    this.successMessage = '';
    this.errorMessage = '';

    const id = this.experienceForm.value.id;

    if (!id || id <= 0) {
      this.errorMessage = 'Update ke liye Experience ID fill karo';
      return;
    }

    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.submitting = true;

    // ✅ id → experienceId map kiya — backend ExperienceUpdateDTO expect karta hai
    const formData = {
      experienceId: this.experienceForm.value.id,  // ✅ Key fix
      userId: this.experienceForm.value.userId,
      companyName: this.experienceForm.value.companyName,
      designation: this.experienceForm.value.designation,
      startDate: this.experienceForm.value.startDate,
      endDate: this.experienceForm.value.isCurrent ? null : this.experienceForm.value.endDate,
      isCurrent: this.experienceForm.value.isCurrent
    };

    console.log('Updating:', formData);

    this.experienceService.updateExperience(formData as any).subscribe({
      next: (response) => {
        console.log('Update response:', response);
        this.submitting = false;
        this.successMessage = 'Experience updated successfully!';
        this.resetForm();
      },
      error: (error) => {
        console.error('Update error:', error);
        this.submitting = false;
        this.errorMessage = 'Error updating experience: ' + error.message;
      }
    });
  }

  resetForm(): void {
    this.experienceForm.reset();
    this.experienceForm.patchValue({ id: 0, isCurrent: false });
  }
}