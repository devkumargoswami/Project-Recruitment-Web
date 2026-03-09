import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../service/register.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm: FormGroup;
  errorMessage: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    // Match backend property names exactly
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', Validators.required],
      countryId: [0, Validators.required],
      stateId: [0, Validators.required],
      totalExperience: [0, [Validators.required, Validators.min(0)]],
      roleId: [0, Validators.required],
      offerCTC: [0, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    // Convert numeric fields to number type
    const payload = {
      ...this.registerForm.value,
      countryId: Number(this.registerForm.value.countryId),
      stateId: Number(this.registerForm.value.stateId),
      roleId: Number(this.registerForm.value.roleId),
      totalExperience: Number(this.registerForm.value.totalExperience),
      offerCTC: Number(this.registerForm.value.offerCTC)
    };

    console.log('Payload to send:', payload);

    this.userService.register(payload).subscribe({
      next: (res) => {
        console.log('API response:', res);
        this.loading = false;
        this.errorMessage = null;
        alert('User registered successfully!');
        this.router.navigate(['/login']); // Navigate after success
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.loading = false;
        this.errorMessage = 'Failed to register user. Check console for details.';
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}