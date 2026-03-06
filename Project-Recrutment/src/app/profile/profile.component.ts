import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService, UserProfile } from '../service/profile.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
    // Form initialization with your API structure
    this.profileForm = this.fb.group({
      id: [''],
      username: ['', Validators.required],
      password: [''],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: [''],
      phoneNumber: [''],
      dateOfBirth: ['', Validators.required],
      address: [''],
      countryId: [''],
      stateId: [''],
      city: [''],
      roleId: [''],
      offerCTC: [''],
      interviewStatus: [''],
      totalExperience: [''],
      createdDateTime: ['']
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

    // Prepare the data for API - ensure proper data types and handle optional fields
    const formData = this.profileForm.getRawValue();
    const updateData: Partial<UserProfile> = {
      id: this.user.id,
      username: formData.username,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender || '',
      phoneNumber: formData.phoneNumber ? Number(formData.phoneNumber) : 0,
      dateOfBirth: formData.dateOfBirth,
      address: formData.address || '',
      countryId: formData.countryId ? Number(formData.countryId) : 0,
      stateId: formData.stateId ? Number(formData.stateId) : 0,
      city: formData.city || '',
      roleId: this.user.roleId, // Keep existing role
      offerCTC: formData.offerCTC ? Number(formData.offerCTC) : 0,
      interviewStatus: formData.interviewStatus ? Number(formData.interviewStatus) : 0,
      totalExperience: formData.totalExperience ? Number(formData.totalExperience) : 0,
      createdDateTime: this.user.createdDateTime // Keep existing creation date
    };

    console.log('Submitting profile data:', updateData);

    this.profileService.updateProfile(updateData).subscribe({
      next: (response) => {
        console.log('Profile update response:', response);
        this.successMessage = 'Profile updated successfully';
        this.errorMessage = '';
        this.loading = false;
      },
      error: (err) => {
        console.error('Profile update error:', err);
        console.error('Error details:', err.error);
        this.errorMessage = 'Update failed: ' + (err.error?.message || err.message || 'Unknown error');
        this.successMessage = '';
        this.loading = false;
      }
    });
  }
}
