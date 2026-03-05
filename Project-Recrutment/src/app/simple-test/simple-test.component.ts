import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simple-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2>Simple Login Test</h2>
      <p>Testing direct API call with proxy...</p>
      
      <div *ngIf="loading" style="color: blue; margin: 10px 0;">
        Loading...
      </div>
      
      <div *ngIf="response" style="color: green; margin: 10px 0;">
        <h3>✅ SUCCESS!</h3>
        <p>Response: {{ response | json }}</p>
      </div>
      
      <div *ngIf="error" style="color: red; margin: 10px 0;">
        <h3>❌ ERROR!</h3>
        <p>Error: {{ error | json }}</p>
      </div>
      
      <button (click)="testApi()" [disabled]="loading" style="
        padding: 10px 20px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
      ">
        {{ loading ? 'Testing...' : 'Test Login API' }}
      </button>
      
      <div style="margin-top: 20px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
        <h4>Instructions:</h4>
        <ol>
          <li>Make sure you started the server with: <code>npm start</code></li>
          <li>Click the "Test Login API" button above</li>
          <li>If you see ✅ SUCCESS, the login will work!</li>
          <li>If you see ❌ ERROR, we need to check the proxy</li>
        </ol>
      </div>
    </div>
  `
})
export class SimpleTestComponent {
  response: any = null;
  error: any = null;
  loading = false;

  constructor(private http: HttpClient) {}

  testApi(): void {
    this.loading = true;
    this.response = null;
    this.error = null;

    // Test the exact same call that login uses
    this.http.post('/api/User/login', {
      email: 'dev@example.com',
      password: 'Dev@123',
      roleId: 1
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.response = res;
        console.log('✅ Simple test successful:', res);
      },
      error: (err) => {
        this.loading = false;
        this.error = err;
        console.error('❌ Simple test failed:', err);
      }
    });
  }
}