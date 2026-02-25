import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {

        // 🔥 Debug - see exact API response
        console.log('FULL API RESPONSE:', res);

        // ✅ Match Swagger response structure
        if (res && res.success === true && res.user) {

          // ✅ Store user
          localStorage.setItem('user', JSON.stringify(res.user));

          console.log('Login success user:', res.user);

          // ✅ Navigate to dashboard
          this.router.navigate(['/dashboard']);

        } else {

          console.log('Login failed response:', res);
          alert('Invalid credentials');
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('HTTP error:', err);
        alert('Server error');
        this.isLoading = false;
      }
    });
  }

  navigateToRegister() {
    this.router.navigate(['/login/register']);
  }

  navigateToForgotPassword() {
    this.router.navigate(['/login/forgot-password']);
  }
}