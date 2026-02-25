import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule , ReactiveFormsModule],
  templateUrl: './frogot-password.component.html',
  styleUrls: ['./frogot-password.component.css']
})
export class ForgotPasswordComponent {

  resetForm!: FormGroup;
  loading = false;
  message = '';
  error = '';

  private apiUrl = 'http://localhost:7027/api/user/forgot-password'; 
  // change URL according to your backend

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.resetForm = this.fb.group({
      userId: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  submit() {
    if (this.resetForm.invalid) return;

    const { newPassword, confirmPassword } = this.resetForm.value;

    if (newPassword !== confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.error = '';
    this.message = '';

    this.http.post<any>(this.apiUrl, this.resetForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        this.message = 'Password updated successfully';

        // auto redirect after 2 sec
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to reset password';
        console.error(err);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}