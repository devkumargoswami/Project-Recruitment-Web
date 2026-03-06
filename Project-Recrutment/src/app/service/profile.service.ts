import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  gender?: string;
  address?: string;
  dob?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private base = 'https://localhost:7001/api/Profile';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.base}/get`);
  }

  updateProfile(profile: Partial<UserProfile>): Observable<any> {
    return this.http.put<any>(`${this.base}/update`, profile);
  }
}