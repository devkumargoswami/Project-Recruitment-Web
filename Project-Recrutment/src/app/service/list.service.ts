import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserListService {
  private api = 'https://localhost:7027/api/List';

  constructor(private http: HttpClient) {}

  // Fetch all users or by ID
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/UserId?id=300`);
  }
}