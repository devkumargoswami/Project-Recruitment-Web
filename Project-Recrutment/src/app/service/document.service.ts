import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private api = 'http://localhost:7027/Document';

  constructor(private http: HttpClient) {}

  insert(formData: FormData): Observable<any> {
    return this.http.post(`${this.api}/Insert`, formData);
  }

  update(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.api}/Update/${id}`, formData);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.api}/GetById/${id}`);
  }

  getByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.api}/GetByUserId/${userId}`);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/Delete/${id}`);
  }
}
