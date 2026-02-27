import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Education {
  id: number;
  userId: number;
  educationLevelId: number;
  educationLevelName?: string;
  schoolCollege: string;
  degree: string;
  startMonth: number;
  startYear: number;
  endMonth?: number;
  endYear?: number;
  isContinue: boolean;
}

@Injectable({ providedIn: 'root' })
export class EducationService {

  private api = 'http://localhost:7027/Education';

  constructor(private http: HttpClient) {}

  // ➜ Create
  create(payload: Education): Observable<any> {
    return this.http.post(`${this.api}/Create`, payload);
  }

  // ➜ Update
  update(id: number, payload: Partial<Education>): Observable<any> {
    return this.http.put(`${this.api}/Update/${id}`, payload);
  }

  // ➜ Delete
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/Delete/${id}`);
  }

  // ➜ Get by User
  getByUserId(userId: number): Observable<Education[]> {
    return this.http.get<Education[]>(`${this.api}/GetByUser/${userId}`);
  }

  // ➜ Get single
  getById(id: number): Observable<Education> {
    return this.http.get<Education>(`${this.api}/Get/${id}`);
  }
}