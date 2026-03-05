import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TestLoginDTO {
  email: string;
  password: string;
  roleId: number;
}

@Component({
  selector: 'app-test-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="test-login-container">
      <h2>Test Login API</h2>
      <div class="test-form">
        <div class="form-group">
          <label>Email:</label>
          <input [(ngModel)]="testData.email" type="email" class="form-control">
        </div>
        <div class="form-group">
          <label>Password:</label>
          <input [(ngModel)]="testData.password" type="password" class="form-control">
        </div>
        <div class="form-group">
          <label>Role ID:</label>
          <select [(ngModel)]="testData.roleId" class="form-control">
            <option value="1">Admin (1)</option>
            <option value="2">HR (2)</option>
            <option value="3">Employer (3)</option>
            <option value="4">Candidate (4)</option>
          </select>
        </div>
        <button (click)="testLogin()" [disabled]="loading" class="btn btn-primary">
          {{ loading ? 'Testing...' : 'Test Login' }}
        </button>
      </div>
      
      <div *ngIf="response" class="response-container">
        <h3>Response:</h3>
        <pre>{{ response | json }}</pre>
      </div>
      
      <div *ngIf="error" class="error-container">
        <h3>Error:</h3>
        <pre>{{ error | json }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .test-login-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 2rem;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    .btn-primary:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    .response-container, .error-container {
      margin-top: 2rem;
      padding: 1rem;
      border-radius: 4px;
    }
    .response-container {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
    }
    .error-container {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  `]
})
export class TestLoginComponent implements OnInit {
  testData: TestLoginDTO = {
    email: 'dev@example.com',
    password: 'Dev@123',
    roleId: 1
  };
  
  response: any = null;
  error: any = null;
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  testLogin(): void {
    this.loading = true;
    this.response = null;
    this.error = null;

    console.log('Testing login with:', this.testData);

    this.http.post('/api/User/login', this.testData)
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.response = res;
          console.log('Test login successful:', res);
        },
        error: (err) => {
          this.loading = false;
          this.error = err;
          console.error('Test login failed:', err);
        }
      });
  }
}