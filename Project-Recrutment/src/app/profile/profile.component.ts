import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService, UserProfile } from '../service/profile.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],   // ✅ REQUIRED
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profileForm!: FormGroup;
  user!: UserProfile;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService
  ) {
    // Form initialization
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      role: [{ value: '', disabled: true }],
      phone: [''],
      gender: [''],
      address: [''],
      dob: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;

    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.user = res;
        this.profileForm.patchValue(res);
        this.loading = false;
      },
      error: (err) => {
        console.error('Profile load error:', err);
        this.errorMessage = 'Failed to load profile';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.loading = true;

    this.profileService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully';
        this.errorMessage = '';
        this.loading = false;
      },
      error: (err) => {
        console.error('Profile update error:', err);
        this.errorMessage = 'Update failed';
        this.successMessage = '';
        this.loading = false;
      }
    });
  }
}