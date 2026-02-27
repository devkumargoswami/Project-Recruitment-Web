import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status?: string;
}

export interface LoginResponse {
  user: AuthUser;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly USER_KEY = 'user';
  private readonly API = 'https://localhost:7027/api/User'; // Updated to match old backend

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  // ─── Login ────────────────────────────────────────────────────────────────────
  login(email: string, password: string, roleId: number): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/login`, { email, password, roleId })
      .pipe(
        tap(res => {
          if (res?.user) {
            this.saveUser(res.user);
          }
        })
      );
  }

  // ─── Logout ──────────────────────────────────────────────────────────────────
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.USER_KEY);
    }
    this.router.navigate(['/login']);
  }

  // ─── Session helpers ─────────────────────────────────────────────────────────
  saveUser(user: AuthUser): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  getUser(): AuthUser | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getUser()?.id;
  }

  isAdminOrHR(): boolean {
    return ['Admin', 'HR'].includes(this.getUser()?.role || '');
  }
}