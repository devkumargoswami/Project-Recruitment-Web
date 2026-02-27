import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  // 🔹 Centralized API base
  private readonly API = 'http://localhost:7027';

  constructor(private http: HttpClient) {}

  /* ───────────────── EDUCATION ───────────────── */

  getEducationByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API}/Education/GetByUserId/${userId}`,
      { headers: this.getSafeAuthHeaders() }
    );
  }

  deleteEducation(educationId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API}/Education/Delete/${educationId}`,
      { headers: this.getSafeAuthHeaders() }
    );
  }

  /* ───────────────── SKILLS ───────────────── */

  getSkillsByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API}/Skills/GetByUserId/${userId}`,
      { headers: this.getSafeAuthHeaders() }
    );
  }

  // ✅ ADDED (fixes your error)
  deleteSkill(skillId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API}/Skills/Delete/${skillId}`,
      { headers: this.getSafeAuthHeaders() }
    );
  }

  /* ───────────────── EXPERIENCE ───────────────── */

  getExperienceByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API}/Experience/GetByUserId/${userId}`,
      { headers: this.getSafeAuthHeaders() }
    );
  }

  // ✅ ADDED (fixes your error)
  deleteExperience(experienceId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API}/Experience/Delete/${experienceId}`,
      { headers: this.getSafeAuthHeaders() }
    );
  }

  /* ───────────────── DOCUMENTS ───────────────── */

  getDocumentsByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API}/Document/GetByUserId/${userId}`,
      { headers: this.getSafeAuthHeaders() }
    );
  }

  deleteDocument(documentId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API}/Document/Delete/${documentId}`,
      { headers: this.getSafeAuthHeaders() }
    );
  }

  /* ───────────────── USERS ───────────────── */

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API}/Users`,
      { headers: this.getSafeAuthHeaders() }
    );
  }

  /* ───────────────── DASHBOARD AGGREGATE ───────────────── */

  getCompleteDashboard(userId: number): Observable<any> {
    return forkJoin({
      education: this.getEducationByUserId(userId),
      skills: this.getSkillsByUserId(userId),
      experience: this.getExperienceByUserId(userId),
      documents: this.getDocumentsByUserId(userId)
    });
  }

  deleteUser(userId: number): Observable<void> {
  return this.http.delete<void>(
    `${this.API}/User/delete/${userId}`, // match your backend route
    { headers: this.getSafeAuthHeaders() }
  );
}

  /* ───────────────── AUTH HEADERS ───────────────── */

  private getSafeAuthHeaders(): HttpHeaders {
    try {
      let token = localStorage.getItem('token');

      if (!token) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          token = user?.token || user?.accessToken || user?.authToken;
        }
      }

      let headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;

    } catch (error) {
      console.warn('Auth headers error:', error);

      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
  }
}