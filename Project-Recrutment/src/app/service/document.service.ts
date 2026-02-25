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
}