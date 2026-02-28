import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map, BehaviorSubject } from 'rxjs';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string | null;
  phonenumber: string | null;
  dataOfBirth: string | null;
  address: string | null;
  countryId: number | null;
  stateId: number | null;
  city: string | null;
  roleId: number;
  role: string;
  offerCTC: number | null;
  totalExperience: number | null;
  createdDateTime: string | null;
  status?: string;
  name: string;
}

export interface UserLoginDTO {
  email: string;
  password: string;
  roleId: number;
}

const ROLE_MAP: Record<number, string> = {
  1: 'Admin',
  2: 'HR',
  3: 'Employer',
  4: 'Candidate'
};

const USER_KEY = 'hrpro_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'https://your-api-url/api/User';

  /** Reactive auth state */
  private authStateSubject = new BehaviorSubject<AuthUser | null>(this.getUser());
  authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  /** LOGIN */
  login(payload: UserLoginDTO): Observable<boolean> {
    return this.http
      .post<{ success: boolean; user: any }>(`${this.apiUrl}/login`, payload)
      .pipe(
        tap(res => {
          if (res?.success && res.user) {
            const mapped = this.mapUser(res.user);
            localStorage.setItem('hrpro_user', JSON.stringify(mapped));
          }
        }),
        map(res => res?.success === true)
      );
  }

  /** USER MAPPING */
  mapUser(raw: any): AuthUser {
    const roleId = raw.roleId ?? raw.RoleId ?? 4;
    const firstName = raw.firstName ?? raw.FirstName ?? '';
    const lastName = raw.lastName ?? raw.LastName ?? '';
    return {
      id: raw.id ?? raw.Id,
      username: raw.username ?? raw.Username ?? '',
      email: raw.email ?? raw.Email ?? '',
      firstName,
      lastName,
      gender: raw.gender ?? raw.Gender ?? null,
      phonenumber: raw.phonenumber ?? raw.Phonenumber ?? null,
      dataOfBirth: raw.dataOfBirth ?? raw.DataOfBirth ?? null,
      address: raw.address ?? raw.Address ?? null,
      countryId: raw.countryId ?? raw.CountryId ?? null,
      stateId: raw.stateId ?? raw.StateId ?? null,
      city: raw.city ?? raw.City ?? null,
      roleId,
      role: ROLE_MAP[roleId] ?? 'Candidate',
      offerCTC: raw.offerCTC ?? raw.OfferCTC ?? null,
      totalExperience: raw.totalExperience ?? raw.TotalExperience ?? null,
      createdDateTime: raw.createdDateTime ?? raw.CreatedDateTime ?? null,
      status: raw.status ?? 'Active',
      name: `${firstName} ${lastName}`.trim() || (raw.username ?? raw.Username ?? ''),
    };
  }

  /** GET USER */
  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as AuthUser; }
    catch { return null; }
  }

  /** AUTH CHECK */
  isLoggedIn(): boolean {
    return !!this.authStateSubject.value;
  }

  /** LOGOUT */
  logout(): void {
    localStorage.removeItem(USER_KEY);
    this.authStateSubject.next(null);
    this.router.navigate(['/login']);
  }
}