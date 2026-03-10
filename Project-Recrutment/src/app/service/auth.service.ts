import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface AuthUser {
  id: number;
  token?: string;
  accessToken?: string;
  authToken?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  gender?: string | null;
  phonenumber?: number | null;
  dataOfBirth?: string | null;
  address?: string | null;
  countryId?: number | null;
  stateId?: number | null;
  city?: string | null;
  roleId?: number;
  role: string;
  offerCTC?: number | null;
  totalExperience?: number | null;
  createdDateTime?: string | null;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Use Angular dev proxy in local development: /api -> backend target in proxy.conf.json
  private apiUrl = '/api';
  private userSubject = new BehaviorSubject<AuthUser | null>(this.loadUserFromStorage());

  authState$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  private loadUserFromStorage(): AuthUser | null {
    try {
      const stored =
        localStorage.getItem('currentUser') ||
        sessionStorage.getItem('currentUser');
      if (!stored) return null;

      const parsed = JSON.parse(stored) as AuthUser;
      const normalizedId = this.extractUserId(parsed);
      if (!normalizedId) return null;
      const normalizedRole = this.resolveRole(parsed, Number(parsed.roleId ?? 0));
      return {
        ...parsed,
        id: normalizedId,
        role: normalizedRole,
      };
    } catch {
      return null;
    }
  }

  login(payload: { email: string; password: string }): Observable<boolean> {
    return this.loginRequest(payload).pipe(
      map(response => {
        if (response) {
          const userData =
            response?.data ??
            response?.result ??
            response?.user ??
            response?.userData ??
            response;

          const userId = this.extractUserId(userData) ?? this.extractUserId(response);
          if (!userId) return false;
          const roleId = this.extractRoleId(userData);
          const role = this.resolveRole(userData, roleId);
          const token = this.extractToken(response, userData);
          const firstName = userData.firstName ?? userData.FirstName ?? '';
          const lastName = userData.lastName ?? userData.LastName ?? '';

          const user: AuthUser = {
            id: userId,
            token: token ?? undefined,
            accessToken: token ?? undefined,
            authToken: token ?? undefined,
            username: userData.username ?? userData.Username ?? '',
            email: userData.email ?? userData.Email ?? payload.email,
            firstName,
            lastName,
            name: userData.name ?? (`${firstName} ${lastName}`.trim() || userData.username || ''),
            gender: userData.gender ?? null,
            phonenumber: userData.phoneNumber ?? userData.phonenumber ?? null,
            dataOfBirth: userData.dateOfBirth ?? userData.dataOfBirth ?? null,
            address: userData.address ?? null,
            countryId: userData.countryId ?? null,
            stateId: userData.stateId ?? null,
            city: userData.city ?? null,
            roleId,
            role,
            offerCTC: userData.offerCTC ?? null,
            totalExperience: userData.totalExperience ?? null,
            createdDateTime: userData.createdDateTime ?? null,
            status: userData.status ?? 'Active',
          };

          localStorage.setItem('currentUser', JSON.stringify(user));
          if (token) {
            localStorage.setItem('token', token);
          } else {
            localStorage.removeItem('token');
          }
          this.userSubject.next(user);
          return true;
        }
        return false;
      }),
      catchError((error) => throwError(() => error))
    );
  }

  private loginRequest(payload: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, payload).pipe(
      catchError(() =>
        this.http.post<any>(`${this.apiUrl}/User/login`, {
          ...payload,
          roleId: 4
        })
      )
    );
  }

  getUser(): AuthUser | null {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    sessionStorage.removeItem('currentUser');
    this.userSubject.next(null);
  }

  private extractToken(response: any, userData: any): string | null {
    const tokenRaw =
      response?.token ??
      response?.accessToken ??
      response?.authToken ??
      response?.jwt ??
      response?.jwtToken ??
      response?.data?.token ??
      response?.data?.accessToken ??
      response?.result?.token ??
      response?.result?.accessToken ??
      userData?.token ??
      userData?.accessToken ??
      userData?.authToken;

    const token = String(tokenRaw ?? '').trim();
    return token ? token : null;
  }

  private extractRoleId(userData: any): number {
    const rawRoleId =
      userData?.roleId ??
      userData?.RoleId ??
      userData?.roleID ??
      userData?.RoleID ??
      userData?.userRoleId ??
      userData?.UserRoleId;

    const parsed = Number(rawRoleId);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 4;
  }

  private extractUserId(userData: any): number | null {
    const rawId =
      userData?.id ??
      userData?.Id ??
      userData?.userId ??
      userData?.UserId;

    const parsed = Number(rawId);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  private resolveRole(userData: any, roleId: number): string {
    const roleRaw =
      userData?.role ??
      userData?.Role ??
      userData?.roleName ??
      userData?.RoleName ??
      userData?.userRole ??
      userData?.UserRole;

    const normalized = this.normalizeRoleName(roleRaw);
    if (normalized) {
      return normalized;
    }

    return this.getRoleName(roleId);
  }

  private normalizeRoleName(role: unknown): string | null {
    const value = String(role ?? '').trim().toLowerCase();
    if (!value) return null;

    if (value === 'admin') return 'Admin';
    if (value === 'hr' || value === 'human resources') return 'HR';
    if (value === 'candidate') return 'Candidate';
    if (value === 'employer' || value === 'manager') return 'Employer';

    return null;
  }

  private getRoleName(roleId: number): string {
    const ROLE_MAP: Record<number, string> = {
      1: 'Admin',
      2: 'HR',
      3: 'Candidate',
      4: 'Employer',
    };
    return ROLE_MAP[roleId] ?? 'Candidate';
  }
}
