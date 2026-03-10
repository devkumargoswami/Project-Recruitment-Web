import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './frogot-password.component.html',
  styleUrls: ['./frogot-password.component.css']
})
export class ForgotPasswordComponent {

  resetForm!: FormGroup;
  loading = false;
  message = '';
  error = '';

  private apiUrl = 'https://localhost:7027/api/User/update-password';
  // change URL according to your backend

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    this.resetForm = this.fb.group({
      identifier: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  submit() {
    if (this.resetForm.invalid) return;

    const { identifier, newPassword, confirmPassword } = this.resetForm.value;

    if (newPassword !== confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.error = '';
    this.message = '';

    let payload: any = {
      userId: null,
      email: null,
      newPassword: newPassword,
      confirmPassword: confirmPassword
    };

    // detect email or userid
    if (!isNaN(identifier)) {
      payload.userId = Number(identifier);
    } else {
      payload.email = identifier;
    }

    console.log("Sending payload:", payload); // 🔍 debug

    this.http.post<any>(this.apiUrl, payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.message = res.message || "Password updated successfully";

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;

        if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = "Password reset failed";
        }

        console.error("API Error:", err);
      }
    });
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
}