import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EducationService {

  private api = 'https://localhost:7027/api/UserEducation';

  constructor(private http: HttpClient) {}

  insert(data: any): Observable<any> {
    return this.http.post(`${this.api}/Insert`, data);
  }

  getByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.api}/GetByUser/${userId}`);
  }

  update(data: any): Observable<any> {
    return this.http.put(`${this.api}/Update`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/Delete/${id}`);
  }
}