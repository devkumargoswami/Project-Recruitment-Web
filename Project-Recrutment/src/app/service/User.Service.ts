import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserModel, UpdatePasswordDTO, ApiResponse } from '../User/User.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = 'https://localhost:7001/api/User';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(`${this.base}/list`);
  }

  insertUser(user: UserModel): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.base}/insert`, user);
  }

  updateUser(user: UserModel): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.base}/update`, user);
  }

  deleteUser(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.base}/delete/${id}`);
  }

  updatePassword(dto: UpdatePasswordDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.base}/update-password`, dto);
  }
}