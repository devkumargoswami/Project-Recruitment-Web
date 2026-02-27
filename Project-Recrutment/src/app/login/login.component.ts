import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { Subject, takeUntil } from 'rxjs';

interface RoleOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnDestroy {

  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  roles: RoleOption[] = [
    { id: 1, name: 'HR' },
    { id: 2, name: 'Admin' },
    { id: 3, name: 'Candidate' },
    { id: 4, name: 'Employer' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      roleId: [null, [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password, roleId } = this.loginForm.value;
    const selectedRoleId = Number(roleId);

    // Pass roleId to backend via AuthService
    this.authService.login(email, password, selectedRoleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res?.user) {
            switch (selectedRoleId) {
              case 1: this.router.navigate(['/dashboard/hr']); break;
              case 2: this.router.navigate(['/dashboard/admin']); break;
              case 3: this.router.navigate(['/dashboard/candidate']); break;
              case 4: this.router.navigate(['/dashboard/employer']); break;
              default: this.router.navigate(['/dashboard']); break;
            }
          } else {
            this.errorMessage = res?.message || 'Invalid credentials. Please try again.';
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err); // log backend error
          this.errorMessage = 'Login failed. Please check your connection and try again.';
          this.isLoading = false;
        }
      });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched(): void {
    Object.values(this.loginForm.controls).forEach(control => control.markAsTouched());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}