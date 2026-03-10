import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InterviewSchedule {
  id: number;
  userId: number;
  interviewTitle: string;
  interviewDateTime: string;
  interviewBy: string;
  status: number;
  comments?: string | null;
  recordingPath?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class InterviewScheduleService {

  private baseUrl = 'https://localhost:5001/api/InterviewSchedule';

  constructor(private http: HttpClient) {}

  // ✅ ADD THIS - HR/Admin ke liye
  getAll(): Observable<InterviewSchedule[]> {
    return this.http.get<InterviewSchedule[]>(`${this.baseUrl}/list`);
  }

  // EXISTING - Candidate ke liye
  getByUserId(userId: number): Observable<InterviewSchedule[]> {
    return this.http.get<InterviewSchedule[]>(`${this.baseUrl}/get/${userId}`);
  }

  insert(data: InterviewSchedule): Observable<any> {
    return this.http.post(`${this.baseUrl}/insert`, data);
  }

  update(data: InterviewSchedule): Observable<any> {
    return this.http.put(`${this.baseUrl}/update`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }
}