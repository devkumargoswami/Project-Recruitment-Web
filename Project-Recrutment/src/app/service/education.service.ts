import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EducationService {
  private api = 'http://localhost:7027/Education';

  constructor(private http: HttpClient) {}

  insert(payload: any): Observable<any> {
    return this.http.post(`${this.api}/Insert`, payload);
  }

  update(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.api}/Update/${id}`, payload);
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
