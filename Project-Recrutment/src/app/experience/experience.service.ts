import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ExperienceModel, ApiResponse } from './experience.model';

@Injectable({ providedIn: 'root' })
export class ExperienceService {
  private base = 'https://localhost:7027/api/Experience'; // ✅ Capital E

  constructor(private http: HttpClient) {}

  getExperiences(): Observable<ExperienceModel[]> {
    return this.http.get<ExperienceModel[]>(`${this.base}/Select`, this.getHeaders());
  }

  insertExperience(experience: ExperienceModel): Observable<ApiResponse> {
    console.log('=== INSERT EXPERIENCE DEBUG ===');
    console.log('Experience data:', experience);
    console.log('API URL:', `${this.base}/Insert`);
    console.log('Request body:', JSON.stringify(experience));

    return this.http.post<ApiResponse>(`${this.base}/Insert`, experience, this.getHeaders()).pipe(
      tap(response => {
        console.log('=== INSERT SUCCESS ===');
        console.log('Response:', response);
      }),
      catchError(error => {
        console.log('=== INSERT ERROR ===');
        console.log('Error status:', error.status);
        console.log('Error message:', error.message);
        console.log('Error details:', error.error);
        return throwError(() => error);
      })
    );
  }

  updateExperience(experience: ExperienceModel): Observable<ApiResponse> {
    console.log('=== UPDATE EXPERIENCE DEBUG ===');
    console.log('Experience data:', experience);
    console.log('API URL:', `${this.base}/Update`);
    console.log('Request body:', JSON.stringify(experience));

    return this.http.put<ApiResponse>(`${this.base}/Update`, experience, this.getHeaders()).pipe(
      tap(response => {
        console.log('=== UPDATE SUCCESS ===');
        console.log('Response:', response);
      }),
      catchError(error => {
        console.log('=== UPDATE ERROR ===');
        console.log('Error status:', error.status);
        console.log('Error message:', error.message);
        console.log('Error details:', error.error);
        return throwError(() => error);
      })
    );
  }

  deleteExperience(id: number): Observable<ApiResponse> {
    console.log('Deleting experience with ID:', id);
    console.log('API URL:', `${this.base}/Delete/${id}`);

    return this.http.delete<ApiResponse>(`${this.base}/Delete/${id}`, this.getHeaders()).pipe(
      tap(response => console.log('Delete response:', response)),
      catchError(error => {
        console.error('Delete error:', error);
        return throwError(() => error);
      })
    );
  }

  searchExperience(id?: number, userId?: number): Observable<ExperienceModel[]> {
    let url = `${this.base}/Select`;
    const params: string[] = [];

    if (id) params.push(`id=${id}`);
    if (userId) params.push(`userId=${userId}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    console.log('Search URL:', url);
    return this.http.get<ExperienceModel[]>(url, this.getHeaders());
  }

  private getHeaders() {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    try {
      let token = localStorage.getItem('token');

      if (!token) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          token = user?.token || user?.accessToken || user?.authToken;
        }
      }

      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    } catch (error) {
      console.warn('Auth headers error:', error);
    }

    return { headers };
  }
}