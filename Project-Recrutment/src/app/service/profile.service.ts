import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  private api = 'http://localhost:7027/User';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.api}/Profile`);
  }

  updateProfile(payload: Partial<UserProfile>): Observable<any> {
    return this.http.put(`${this.api}/UpdateProfile`, payload);
  }
}