import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EducationService {

  private api = 'http://localhost:7027/Education';

  constructor(private http: HttpClient) {}

  insert(data: any): Observable<any> {
    return this.http.post(`${this.api}/Insert`, data);
  }
}