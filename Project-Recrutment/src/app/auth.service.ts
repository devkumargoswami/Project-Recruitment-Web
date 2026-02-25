import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://localhost:7027/api/User/login';

  constructor(private http: HttpClient) {}

  // ✅ Return full API response (not boolean)
  login(data: LoginRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  // ✅ Simple local session handling
  logout() {
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }
}