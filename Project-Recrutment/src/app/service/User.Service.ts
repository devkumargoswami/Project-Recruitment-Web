import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserModel, UpdatePasswordDTO, ApiResponse } from '../User/User.model';

@Injectable({ 
  providedIn: 'root' 
})
export class UserService {

  // Option 1: Using proxy (recommended for development)
  private base = '/api/User';
  
  // Option 2: Direct URL (for production)
  // private base = 'https://localhost:7027/api/User';

  constructor(private http: HttpClient) {}

  // Get auth headers with Bearer token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // ============= GET ALL USERS =============
  getUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(
      `${this.base}/list`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error loading users:', error);
        return throwError(() => new Error('Failed to load users'));
      })
    );
  }

  // ============= GET SINGLE USER =============
  getUserById(id: number): Observable<UserModel> {
    return this.http.get<UserModel>(
      `${this.base}/${id}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error loading user:', error);
        return throwError(() => new Error('Failed to load user'));
      })
    );
  }

  // ============= INSERT USER =============
  insertUser(user: UserModel): Observable<ApiResponse> {
    const payload = {
      username: user.username,
      password: user.password,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      address: user.address,
      countryId: user.countryId,
      stateId: user.stateId,
      city: user.city,
      roleId: user.roleId,
      offerCTC: user.offerCTC,
      interviewStatus: user.interviewStatus,
      totalExperience: user.totalExperience
    };

    console.log('Creating user with payload:', payload);

    return this.http.post<ApiResponse>(
      `${this.base}/insert`,
      payload,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error creating user:', error);
        const message = error.error?.message || 'Failed to create user';
        return throwError(() => new Error(message));
      })
    );
  }

  // ============= UPDATE USER =============
  updateUser(user: UserModel): Observable<ApiResponse> {
    const payload = {
      id: Number(user.id),
      username: user.username?.trim(),
      email: user.email?.trim(),
      firstName: user.firstName?.trim(),
      lastName: user.lastName?.trim(),
      gender: user.gender ?? '',
      phoneNumber: user.phoneNumber ?? 0,
      dateOfBirth: user.dateOfBirth,
      address: user.address ?? '',
      countryId: user.countryId ?? 0,
      stateId: user.stateId ?? 0,
      city: user.city ?? '',
      roleId: user.roleId ?? 0,
      offerCTC: user.offerCTC ?? 0,
      interviewStatus: user.interviewStatus ?? 0,
      totalExperience: user.totalExperience ?? 0,
      createdDateTime: user.createdDateTime ?? new Date().toISOString()
    };

    console.log('Updating user with payload:', payload);

    return this.http.put<ApiResponse>(
      `${this.base}/update`,
      payload,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error updating user:', error);
        const message = error.error?.message || 'Failed to update user';
        return throwError(() => new Error(message));
      })
    );
  }

  // ============= DELETE USER =============
  deleteUser(id: number): Observable<ApiResponse> {
    console.log('Deleting user with ID:', id);

    return this.http.delete<ApiResponse>(
      `${this.base}/delete/${id}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error deleting user:', error);
        const message = error.error?.message || 'Failed to delete user';
        return throwError(() => new Error(message));
      })
    );
  }

  // ============= UPDATE PASSWORD =============
  updatePassword(dto: UpdatePasswordDTO): Observable<ApiResponse> {
    const payload = {
      userId: dto.userId,
      newPassword: dto.newPassword,
      confirmPassword: dto.confirmPassword
    };

    console.log('Updating password for user:', dto.userId);

    return this.http.post<ApiResponse>(
      `${this.base}/update-password`,
      payload,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error updating password:', error);
        const message = error.error?.message || 'Failed to update password';
        return throwError(() => new Error(message));
      })
    );
  }

  // ============= SEARCH USERS =============
  searchUsers(query: string): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(
      `${this.base}/search?query=${query}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error searching users:', error);
        return throwError(() => new Error('Failed to search users'));
      })
    );
  }

  // ============= GET BY ROLE =============
  getUsersByRole(roleId: number): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(
      `${this.base}/role/${roleId}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error loading users by role:', error);
        return throwError(() => new Error('Failed to load users'));
      })
    );
  }
}