import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { DocumentModel } from '../document/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private readonly API = 'https://localhost:7027/api/Document';

  constructor(private http: HttpClient) {}

  /** GET documents by user */
  getByUserId(userId: number): Observable<DocumentModel[]> {
    console.log('Getting documents by userId:', userId);
    return this.http.get<DocumentModel[]>(
      `${this.API}/GetByUser/${userId}`, 
      this.getHeaders()
    ).pipe(
      tap(response => console.log('Documents loaded:', response)),
      catchError(error => {
        console.error('Get documents error:', error);
        return throwError(() => error);
      })
    );
  }

  /** GET document by ID */
  getById(id: number): Observable<DocumentModel> {
    console.log('Getting document by ID:', id);
    return this.http.get<DocumentModel>(`${this.API}/Get/${id}`, this.getHeaders());
  }

  /** INSERT document */
  insert(documentData: any): Observable<any> {
    console.log('=== INSERT DOCUMENT DEBUG ===');
    console.log('Document data:', documentData);
    console.log('API URL:', `${this.API}/Insert`);
    console.log('Headers:', this.getHeaders());

    // Convert to the exact format your API expects
    const payload = {
      userId: documentData.userId,
      documentName: documentData.documentName,
      documentPath: documentData.documentPath || '',
      createDatetime: new Date().toISOString()
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

  /** UPDATE document */
  update(id: number, documentData: any): Observable<any> {
    console.log('=== UPDATE DOCUMENT DEBUG ===', id);
    console.log('Document data:', documentData);

    // Convert to the exact format your API expects
    const payload = {
      documentId: id,
      userId: documentData.userId,
      documentName: documentData.documentName,
      documentPath: documentData.documentPath || '',
      createDatetime: new Date().toISOString()
    };

    return this.http.put(`${this.API}/Update/${id}`, payload, this.getHeaders()).pipe(
      tap(response => console.log('Update success:', response)),
      catchError(error => {
        console.error('Update error:', error);
        return throwError(() => error);
      })
    );
  }

  /** DELETE document */
  delete(id: number): Observable<any> {
    console.log('Deleting document with ID:', id);
    console.log('API URL:', `${this.API}/Delete/${id}`);
    
    return this.http.delete(`${this.API}/Delete/${id}`, this.getHeaders()).pipe(
      tap(response => console.log('Delete response:', response)),
      catchError(error => {
        console.error('Delete error:', error);
        return throwError(() => error);
      })
    );
  }

  /** Get logged user id from localStorage */
  getCurrentUserId(): Observable<number> {
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

  /** HTTP Headers */
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
