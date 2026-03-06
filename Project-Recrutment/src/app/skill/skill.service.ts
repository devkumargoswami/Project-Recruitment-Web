import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { SkillModel, ApiResponse } from './skill.model';

@Injectable({ providedIn: 'root' })
export class SkillService {
  private base = 'https://localhost:7027/api/skill'; // Use proxy path

  constructor(private http: HttpClient) {}

  getSkills(): Observable<SkillModel[]> {
    return this.http.get<SkillModel[]>(`${this.base}/select`, this.getHeaders());
  }

  insertSkill(skill: SkillModel): Observable<ApiResponse> {
    console.log('=== INSERT SKILL DEBUG ===');
    console.log('Skill data:', skill);
    console.log('API URL:', `${this.base}/Insert`);
    console.log('Headers:', this.getHeaders());
    console.log('Request body:', JSON.stringify(skill));
    
    // Check if userId is a number (common issue)
    if (typeof skill.userId !== 'number') {
      console.warn('⚠️  WARNING: userId is not a number:', typeof skill.userId, skill.userId);
    }
    
    // Check if name is a string
    if (typeof skill.name !== 'string') {
      console.warn('⚠️  WARNING: name is not a string:', typeof skill.name, skill.name);
    }
    
    // Check if id is 0 (should be)
    if (skill.id !== 0) {
      console.warn('⚠️  WARNING: id should be 0 for insert:', skill.id);
    }
    
    // Add more detailed error handling
    return this.http.post<ApiResponse>(`${this.base}/Insert`, skill, this.getHeaders()).pipe(
      tap(response => {
        console.log('=== INSERT SUCCESS ===');
        console.log('Response:', response);
      }),
      catchError(error => {
        console.log('=== INSERT ERROR ===');
        console.log('Error status:', error.status);
        console.log('Error statusText:', error.statusText);
        console.log('Error message:', error.message);
        console.log('Error details:', error.error);
        console.log('Full error object:', error);
        
        // Try to extract more details from the error
        if (error.error) {
          console.log('Server error response:', error.error);
        }
        
        return throwError(() => error);
      })
    );
  }

  // updateSkill(skill: SkillModel): Observable<ApiResponse> {
  //   return this.http.put<ApiResponse>(`${this.base}/update`, skill, this.getHeaders());
  // }

  deleteSkill(id: number): Observable<ApiResponse> {
    console.log('Deleting skill with ID:', id);
    console.log('API URL:', `${this.base}/Delete/${id}`);
    
    return this.http.delete<ApiResponse>(`${this.base}/Delete/${id}`, this.getHeaders()).pipe(
      tap(response => console.log('Delete response:', response)),
      catchError(error => {
        console.error('Delete error:', error);
        return throwError(() => error);
      })
    );
  }

  searchSkill(id?: number, userId?: number): Observable<SkillModel[]> {
    let url = `${this.base}/Select`;
    const params: string[] = [];
    
    if (id) params.push(`id=${id}`);
    if (userId) params.push(`userId=${userId}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    console.log('Search URL:', url);
    return this.http.get<SkillModel[]>(url, this.getHeaders());
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
