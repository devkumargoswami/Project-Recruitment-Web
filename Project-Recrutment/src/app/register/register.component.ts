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

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    // Match backend property names exactly
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', Validators.required],
      countryId: [0, Validators.required],
      stateId: [0, Validators.required],
      roleId: [0, Validators.required],
      totalExperience: [0, [Validators.required, Validators.min(0)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      alert('Please fill all required fields correctly.');
      return;
    }

    // Convert numeric fields to number type
    const payload = {
      ...this.registerForm.value,
      countryId: Number(this.registerForm.value.countryId),
      stateId: Number(this.registerForm.value.stateId),
      roleId: Number(this.registerForm.value.roleId),
      totalExperience: Number(this.registerForm.value.totalExperience)
    };

    console.log('Payload to send:', payload);

    this.userService.register(payload).subscribe({
      next: (res) => {
        console.log('API response:', res);
        alert('User registered successfully!');
        this.router.navigate(['/login']); // Navigate after success
      },
      error: (err) => {
        console.error('Registration error:', err);
        alert('Failed to register user. Check console for details.');
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}