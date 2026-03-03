import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/* 🔹 Experience Model */
export interface Experience {
  experienceId: number;
  userId: number;
  companyName: string;
  designation: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {

  private baseUrl = 'https://localhost:5001/api/Experience';

  constructor(private http: HttpClient) {}

  /* 🔹 Get By User */
  getExperiences(userId: number): Observable<Experience[]> {
    return this.http.get<Experience[]>(`${this.baseUrl}/get/${userId}`);
  }

  /* 🔹 Insert */
  insertExperience(data: Experience): Observable<any> {
    return this.http.post(`${this.baseUrl}/insert`, data);
  }

  /* 🔹 Update */
  updateExperience(data: Experience): Observable<any> {
    return this.http.put(`${this.baseUrl}/update`, data);
  }

  /* 🔹 Delete */
  deleteExperience(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }
}