import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { DocumentModel, ApiResponse } from '../document/document.model';  // ✅ Import models

@Injectable({ providedIn: 'root' })
export class DocumentService {
  // ✅ FIXED: Match your API specification
  private readonly API = 'https://localhost:7027/api/Document';  // Use /api/Document endpoints

  constructor(private http: HttpClient) {}

  /** ✅ GET - Get documents by user ID */
  getDocuments(userId: number): Observable<DocumentModel[]> {
    console.log('=== GETTING DOCUMENTS ===');
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

  /** ✅ INSERT - Match your API specification */
  insert(documentData: any): Observable<any> {
    console.log('=== INSERT DOCUMENT DEBUG ===');
    console.log('Document data:', documentData);
    console.log('API URL:', `${this.API}/Insert`);
    console.log('Headers:', this.getHeaders());

    // Convert to the exact format your API expects
    const payload = {
      userId: documentData.userId,
      documentName: documentData.documentName,
      documentPath: documentData.documentPath,
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

  /** ✅ UPDATE - Match your API specification */
  update(id: number, documentData: any): Observable<any> {
    console.log('=== UPDATE DOCUMENT DEBUG ===', id);
    console.log('Document data:', documentData);

    // Convert to the exact format your API expects
    const payload = {
      documentId: id,
      userId: documentData.userId,
      documentName: documentData.documentName,
      documentPath: documentData.documentPath,
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

  /** ✅ GET BY ID - Get document by ID */
  getById(id: number): Observable<DocumentModel> {
    console.log('Getting document by ID:', id);
    return this.http.get<DocumentModel>(`${this.API}/Get/${id}`, this.getHeaders());
  }

  /** ✅ GET BY USER ID */
  getByUserId(userId: number): Observable<DocumentModel[]> {
    console.log('Getting documents by userId:', userId);
    return this.http.get<DocumentModel[]>(
      `${this.API}/GetByUser/${userId}`, 
      this.getHeaders()
    );
  }

  /** ✅ DELETE - Delete by document ID */
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
