import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Experience } from './experience.model';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  // Use dev proxy: /api -> https://localhost:7027
  private readonly baseUrl = '/api/Experience';

  constructor(private http: HttpClient) {}

  getAllExperiences(): Observable<Experience[]>;
  getAllExperiences(userId: number): Observable<Experience[]>;
  getAllExperiences(userId?: number): Observable<Experience[]> {
    const url = typeof userId === 'number'
      ? `${this.baseUrl}/Select/${userId}`
      : `${this.baseUrl}/Select`;
    return this.http.get<Experience[]>(url);
  }

  /**
   * Get single experience by ID
   * Backend MUST verify ownership before returning
   */
  getExperienceById(id: number): Observable<Experience> {
    return this.http.get<Experience>(`${this.baseUrl}/GetById/${id}`);
  }

  /**
   * Create experience for current user
   * Backend automatically assigns userId from JWT token
   */
  createExperience(experience: Experience): Observable<Experience> {
    return this.http.post<Experience>(`${this.baseUrl}/Insert`, experience);
  }

  /**
   * Update experience
   * Backend MUST verify ownership
   */
  updateExperience(id: number, experience: Experience): Observable<Experience> {
    const payload = { ...experience, id };
    return this.http.put<Experience>(`${this.baseUrl}/Update`, payload);
  }

  /**
   * Delete experience
   * Backend MUST verify ownership
   */
  deleteExperience(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Delete/${id}`);
  }

  /**
   * Get experiences for specific user (HR/Admin only)
   * Backend MUST verify user is HR/Admin
   */
  getExperiencesByUserId(userId: number): Observable<Experience[]> {
    return this.http.get<Experience[]>(`${this.baseUrl}/Select/${userId}`);
  }
}
