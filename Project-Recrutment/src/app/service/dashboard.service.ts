import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly API = 'https://localhost:7027/api';  // ✅ https + /api added

  constructor(private http: HttpClient) {}

  /* ───────────────── EDUCATION ───────────────── */

  getEducationByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API}/api/UserEducation/GetByUser/${userId}`,
      { headers: this.getSafeAuthHeaders() }
    );
  }

  deleteEducation(educationId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API}/api/UserEducation/Delete/${educationId}`,
      { headers: this.getSafeAuthHeaders() }
    );
  }

  /* ───────────────── SKILLS ───────────────── */

  getSkillsByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API}/Skill/GetByUserId/${userId}`,
      { headers: this.getSafeAuthHeaders() }
    );
  }

  deleteSkill(skillId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API}/Skill/Delete/${skillId}`,
      { headers: this.getSafeAuthHeaders() }
    );
  }

  /* ───────────────── EXPERIENCE ───────────────── */

  getExperienceByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API}/Experience/Select/${userId}`,  // ✅ Fixed URL
      { headers: this.getSafeAuthHeaders() }
    );
  }

  deleteExperience(experienceId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API}/Experience/Delete/${experienceId}`,  // ✅ Fixed URL
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

  /* ───────────────── RESULTS ───────────────── */

  getResultsByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API}/Result/GetByUserId/${userId}`,
      { headers: this.getSafeAuthHeaders() }
    );
  }

  deleteResult(resultId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API}/Result/Delete/${resultId}`,
      { headers: this.getSafeAuthHeaders() }
    );
  }

  /* ───────────────── USERS ───────────────── */

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API}/User/list`,
      { headers: this.getSafeAuthHeaders() }
    );
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API}/User/delete/${userId}`,
      { headers: this.getSafeAuthHeaders() }
    );
  }

  /* ───────────────── DASHBOARD AGGREGATE ───────────────── */

  getCompleteDashboard(userId: number): Observable<any> {
    return forkJoin({
      education:  this.getEducationByUserId(userId),
      skills:     this.getSkillsByUserId(userId),
      experience: this.getExperienceByUserId(userId),
      documents:  this.getDocumentsByUserId(userId),
      results:    this.getResultsByUserId(userId)
    });
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
      return new HttpHeaders({ 'Content-Type': 'application/json' });
    }
  }
}