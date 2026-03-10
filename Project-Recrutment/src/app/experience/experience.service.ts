import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Experience, ExperienceResponse } from './experience.model';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  private apiUrl = 'https://localhost:7027/api/Experience';

  constructor(private http: HttpClient) {}

  getAllExperiences(userId: number, includeAll = false): Observable<Experience[] | ExperienceResponse> {
    if (includeAll) {
      return this.http
        .get<Experience[] | ExperienceResponse>(`${this.apiUrl}/Select`)
        .pipe(
          catchError(() =>
            this.http.get<Experience[] | ExperienceResponse>(`${this.apiUrl}/Select/${userId}`)
          )
        );
    }

    return this.http.get<Experience[] | ExperienceResponse>(`${this.apiUrl}/Select/${userId}`);
  }

  getExperienceById(id: number): Observable<Experience> {
    return this.http.get<Experience>(`${this.apiUrl}/Select/${id}`).pipe(
      catchError(() =>
        this.http.get<Experience>(`${this.apiUrl}/Get/${id}`).pipe(
          catchError(() =>
            this.http.get<Experience>(`${this.apiUrl}/SelectById/${id}`)
          )
        )
      )
    );
  }

  createExperience(experience: Experience): Observable<Experience> {
    return this.http.post<Experience>(
      `${this.apiUrl}/Insert`,
      this.toApiPayload(experience, experience.id ?? 0)
    );
  }

  updateExperience(id: number, experience: Experience): Observable<Experience> {
    const payload = this.toApiPayload(experience, id);
    return this.http.put<Experience>(`${this.apiUrl}/Update`, payload).pipe(
      catchError(() =>
        this.http.put<Experience>(`${this.apiUrl}/Update/${id}`, payload).pipe(
          catchError(() =>
            this.http.post<Experience>(`${this.apiUrl}/Update`, payload)
          )
        )
      )
    );
  }

  deleteExperience(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Delete/${id}`);
  }

  private toApiPayload(experience: Experience, id: number): any {
    const userId = Number((experience as any).userId ?? 0);
    const isCurrent = !!(experience as any).isCurrent;

    // Accept YYYY-MM from form and send full date format backend usually expects.
    const startDate = this.normalizeDate(experience.startDate);
    const endDate = isCurrent ? null : this.normalizeDate(experience.endDate);

    return {
      id,
      experienceId: id,
      experienceID: id,
      experience_Id: id,
      expId: id,
      userId,
      companyName: experience.companyName,
      designation: experience.designation,
      startDate,
      endDate,
      isCurrent,

      // Alias fields for stricter backends expecting PascalCase or alternate names.
      Id: id,
      ExperienceId: id,
      ExperienceID: id,
      Experience_Id: id,
      UserId: userId,
      CompanyName: experience.companyName,
      Designation: experience.designation,
      StartDate: startDate,
      EndDate: endDate,
      IsCurrent: isCurrent
    };
  }

  private normalizeDate(value?: string): string | null {
    if (!value) return null;
    if (/^\d{4}-\d{2}$/.test(value)) return `${value}-01`;
    return value;
  }
}
