import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Result } from '../result/result.model';

@Injectable({
  providedIn: 'root'
})
export class ResultService {

  private apiUrl = 'https://localhost:7027/api/Result';

  constructor(private http: HttpClient) {}

  insertResult(result: Result): Observable<any> {
    return this.http.post(`${this.apiUrl}/Insert`, result);
  }

  getResultByCandidate(id: number): Observable<Result[]> {
    return this.http.get<Result[]>(`${this.apiUrl}/GetByCandidate/${id}`);
  }

  updateResult(result: Result): Observable<any> {
    return this.http.put(`${this.apiUrl}/Update`, result);
  }

  deleteResult(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Delete/${id}`);
  }
}
