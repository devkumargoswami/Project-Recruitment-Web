import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { EducationModel } from '../education/education.model';

@Injectable({ providedIn: 'root' })
export class EducationService {

  // ✅ FIXED: Use relative path to match proxy configuration
  private readonly API = '/api/UserEducation';  // Use /api/UserEducation endpoints

  constructor(private http: HttpClient) {}

  /** ✅ INSERT - Match your API specification */
  insert(educationData: any): Observable<any> {
    console.log('=== INSERT EDUCATION DEBUG ===');
    console.log('Education data:', educationData);
    console.log('API URL:', `${this.API}/Insert`);
    console.log('Headers:', this.getHeaders());

    // Convert to the exact format your API expects
    const payload: EducationModel = {
      id: 0,
      userId: educationData.userId,
      educationLevelId: educationData.educationLevelId,
      schoolCollege: educationData.schoolCollege,
      boardUniversity: educationData.boardUniversity || '',
      degree: educationData.degree,
      startMonth: educationData.startMonth,
      startYear: educationData.startYear,
      endMonth: educationData.endMonth || 0,
      endYear: educationData.endYear || 0,
      isContinue: educationData.isContinue
    };

    return this.http.post(`${this.API}/Insert`, payload, this.getHeaders()).pipe(
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
        
        if (error.error) {
          console.log('Server error response:', error.error);
        }
        
        return throwError(() => error);
      })
    );
  }

  /** ✅ UPDATE - Match your API specification */
  update(educationData: any): Observable<any> {
    console.log('=== UPDATE EDUCATION DEBUG ===', educationData.id);
    console.log('Education data:', educationData);

    // Convert to the exact format your API expects
    const payload: EducationModel = {
      id: educationData.id,
      userId: educationData.userId,
      educationLevelId: educationData.educationLevelId,
      schoolCollege: educationData.schoolCollege,
      boardUniversity: educationData.boardUniversity || '',
      degree: educationData.degree,
      startMonth: educationData.startMonth,
      startYear: educationData.startYear,
      endMonth: educationData.endMonth || 0,
      endYear: educationData.endYear || 0,
      isContinue: educationData.isContinue
    };

    return this.http.put(`${this.API}/Update`, payload, this.getHeaders()).pipe(
      tap(response => console.log('Update success:', response)),
      catchError(error => {
        console.error('Update error:', error);
        return throwError(() => error);
      })
    );
  }

  /** ✅ DELETE - Delete by education ID */
  delete(id: number): Observable<any> {
    console.log('Deleting education with ID:', id);
    console.log('API URL:', `${this.API}/Delete/${id}`);
    
    return this.http.delete(`${this.API}/Delete/${id}`, this.getHeaders()).pipe(
      tap(response => console.log('Delete response:', response)),
      catchError(error => {
        console.error('Delete error:', error);
        return throwError(() => error);
      })
    );
  }

  /** ✅ GET BY ID - Get education by ID */
  getById(id: number): Observable<EducationModel> {
    console.log('Getting education by ID:', id);
    return this.http.get<EducationModel>(`${this.API}/Get/${id}`, this.getHeaders());
  }

  /** ✅ GET BY USER ID */
  getByUserId(userId: number): Observable<EducationModel[]> {
    console.log('Getting education by userId:', userId);
    return this.http.get<EducationModel[]>(
      `${this.API}/GetByUser/${userId}`, 
      this.getHeaders()
    ).pipe(
      tap(response => console.log('Education loaded:', response)),
      catchError(error => {
        console.error('Get education error:', error);
        return throwError(() => error);
      })
    );
  }

  /** ✅ GET CURRENT USER ID - Use profile service to get current user ID */
  getCurrentUserId(): Observable<number> {
    // Use localStorage user ID as fallback since we can't import ProfileService
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const userId = user?.id;
        if (userId && userId > 0) {
          console.log('Current user from localStorage:', userId);
          return of(userId);
        }
      }
    } catch (error) {
      console.warn('Failed to get user from localStorage:', error);
    }
    
    // Fallback to 0 if no user found
    console.log('No user found, returning 0');
    return of(0);
  }

  /** ✅ EXACT SAME HEADERS as SkillService */
  private getHeaders() {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'  // Note: FormData will override this
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


