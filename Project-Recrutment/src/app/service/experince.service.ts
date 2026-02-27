import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  private apiUrl = 'https://localhost:7000/api/Experience'; // Apna API URL yahan change karein

  constructor(private http: HttpClient) { }

  // GET: User ki saari experiences leke aana
  getExperiences(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get/${userId}`);
  }

  // POST: Naya experience add karna
  insertExperience(experience: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/insert`, experience);
  }

  // PUT: Experience update karna
  updateExperience(experience: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, experience);
  }

  // DELETE: Experience delete karna
  deleteExperience(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}