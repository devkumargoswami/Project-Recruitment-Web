import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserModel } from '../User/User.model';

export interface UserProfile extends UserModel {}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private base = 'https://localhost:7001/api/User';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.base}/select`);
  }

  updateProfile(profile: Partial<UserProfile>): Observable<any> {
    // Prepare the data for API - ensure proper data types and handle optional fields
    const updateData: Partial<UserProfile> = {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      gender: profile.gender || '',
      phoneNumber: profile.phoneNumber || 0,
      dateOfBirth: profile.dateOfBirth,
      address: profile.address || '',
      countryId: profile.countryId || 0,
      stateId: profile.stateId || 0,
      city: profile.city || '',
      roleId: profile.roleId,
      offerCTC: profile.offerCTC || 0,
      interviewStatus: profile.interviewStatus || 0,
      totalExperience: profile.totalExperience || 0,
      createdDateTime: profile.createdDateTime
    };

    console.log('Update Profile Data:', updateData);
    return this.http.put<any>(`${this.base}/update`, updateData);
  }
}
