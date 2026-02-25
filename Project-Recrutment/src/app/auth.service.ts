import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:7027/api/login';

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<boolean> {
    return this.http.post<any>(this.apiUrl, data).pipe(
      map(response => {
        // ✅ backend just returns success/failure
        if (response === true || response?.success === true) {
          localStorage.setItem('isLoggedIn', 'true');
          return true;
        }
        return false;
      })
    );
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }
}