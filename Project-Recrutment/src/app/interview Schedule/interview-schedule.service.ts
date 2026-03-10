import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { InterviewSchedule } from './interview-schedule.model';

@Injectable({
  providedIn: 'root'
})
export class InterviewScheduleService {
  // Uses Angular proxy: /api -> https://localhost:7027
  private readonly baseUrl = '/api/InterviewSchedule';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<InterviewSchedule[]>;
  getAll(userId: number): Observable<InterviewSchedule[]>;
  getAll(userId?: number): Observable<InterviewSchedule[]> {
    const urls = typeof userId === 'number'
      ? [
          `${this.baseUrl}/get/${userId}`,
          `${this.baseUrl}/Get/${userId}`,
          `${this.baseUrl}/Select/${userId}`,
        ]
      : [
          `${this.baseUrl}/list`,
          `${this.baseUrl}/List`,
          `${this.baseUrl}/Select`,
        ];

    return this.getManyWithFallback(urls);
  }

  getByUserId(): Observable<InterviewSchedule[]>;
  getByUserId(userId: number): Observable<InterviewSchedule[]>;
  getByUserId(userId?: number): Observable<InterviewSchedule[]> {
    if (typeof userId === 'number') {
      return this.getAll(userId);
    }
    return this.getAll();
  }

  getById(id: number): Observable<InterviewSchedule> {
    const urls = [
      `${this.baseUrl}/${id}`,
      `${this.baseUrl}/getById/${id}`,
      `${this.baseUrl}/GetById/${id}`,
      `${this.baseUrl}/get/${id}`,
      `${this.baseUrl}/Get/${id}`,
    ];

    return this.getOneWithFallback(urls);
  }

  insert(payload: Omit<InterviewSchedule, 'id'>): Observable<string> {
    const urls = [`${this.baseUrl}/insert`, `${this.baseUrl}/Insert`];
    return this.postTextWithFallback(urls, payload);
  }

  update(payload: InterviewSchedule): Observable<string> {
    const urls = [`${this.baseUrl}/update`, `${this.baseUrl}/Update`];
    return this.putTextWithFallback(urls, payload);
  }

  delete(id: number): Observable<string> {
    const urls = [
      `${this.baseUrl}/delete/${id}`,
      `${this.baseUrl}/Delete/${id}`,
      `${this.baseUrl}/delete?id=${id}`,
      `${this.baseUrl}/Delete?id=${id}`,
    ];

    return this.deleteTextWithFallback(urls);
  }

  private getSafeAuthHeaders(): HttpHeaders {
    let token = localStorage.getItem('token');

    if (!token) {
      const userRaw =
        localStorage.getItem('currentUser') ||
        localStorage.getItem('user') ||
        sessionStorage.getItem('currentUser');

      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          token = user?.token || user?.accessToken || user?.authToken || null;
        } catch {
          token = null;
        }
      }
    }

    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private getManyWithFallback(urls: string[], index = 0): Observable<InterviewSchedule[]> {
    if (index >= urls.length) {
      return throwError(() => new Error('No interview list endpoint succeeded'));
    }

    return this.http.get<any>(urls[index], { headers: this.getSafeAuthHeaders() }).pipe(
      map((res) => this.extractRows(res).map((row: any) => this.normalizeSchedule(row))),
      catchError((err) => this.shouldTryNextEndpoint(err, index, urls.length)
        ? this.getManyWithFallback(urls, index + 1)
        : throwError(() => err))
    );
  }

  private getOneWithFallback(urls: string[], index = 0): Observable<InterviewSchedule> {
    if (index >= urls.length) {
      return throwError(() => new Error('No interview getById endpoint succeeded'));
    }

    return this.http.get<any>(urls[index], { headers: this.getSafeAuthHeaders() }).pipe(
      map((res) => this.normalizeSchedule(this.extractFirstRow(res))),
      catchError((err) => this.shouldTryNextEndpoint(err, index, urls.length)
        ? this.getOneWithFallback(urls, index + 1)
        : throwError(() => err))
    );
  }

  private postTextWithFallback(urls: string[], body: unknown, index = 0): Observable<string> {
    if (index >= urls.length) {
      return throwError(() => new Error('No interview insert endpoint succeeded'));
    }

    return this.http.post(urls[index], body, {
      headers: this.getSafeAuthHeaders(),
      responseType: 'text'
    }).pipe(
      catchError((err) => this.shouldTryNextEndpoint(err, index, urls.length)
        ? this.postTextWithFallback(urls, body, index + 1)
        : throwError(() => err))
    );
  }

  private putTextWithFallback(urls: string[], body: unknown, index = 0): Observable<string> {
    if (index >= urls.length) {
      return throwError(() => new Error('No interview update endpoint succeeded'));
    }

    return this.http.put(urls[index], body, {
      headers: this.getSafeAuthHeaders(),
      responseType: 'text'
    }).pipe(
      catchError((err) => this.shouldTryNextEndpoint(err, index, urls.length)
        ? this.putTextWithFallback(urls, body, index + 1)
        : throwError(() => err))
    );
  }

  private deleteTextWithFallback(urls: string[], index = 0): Observable<string> {
    if (index >= urls.length) {
      return throwError(() => new Error('No interview delete endpoint succeeded'));
    }

    return this.http.delete(urls[index], {
      headers: this.getSafeAuthHeaders(),
      responseType: 'text'
    }).pipe(
      catchError((err) => this.shouldTryNextEndpoint(err, index, urls.length)
        ? this.deleteTextWithFallback(urls, index + 1)
        : throwError(() => err))
    );
  }

  private shouldTryNextEndpoint(err: unknown, index: number, total: number): boolean {
    if (index >= total - 1) return false;

    const status = (err as HttpErrorResponse)?.status ?? 0;
    // Retry next route variant only for likely route mismatch/network issues.
    return status === 0 || status === 404 || status === 405;
  }

  private extractRows(response: any): any[] {
    if (Array.isArray(response)) return response;

    const nested =
      response?.data ??
      response?.result ??
      response?.items ??
      response?.list ??
      response?.records ??
      response?.Data ??
      response?.Result ??
      response?.Items ??
      response?.List ??
      response?.Records;

    if (Array.isArray(nested)) return nested;
    if (Array.isArray(nested?.data)) return nested.data;
    if (Array.isArray(nested?.items)) return nested.items;
    if (Array.isArray(nested?.$values)) return nested.$values;
    if (Array.isArray(response?.$values)) return response.$values;
    if (nested && typeof nested === 'object') return [nested];
    if (response && typeof response === 'object') return [response];
    return [];
  }

  private extractFirstRow(response: any): any {
    const rows = this.extractRows(response);
    return rows.length ? rows[0] : response;
  }

  private normalizeSchedule(raw: any): InterviewSchedule {
    const toNullable = (v: unknown): string | null => {
      const text = String(v ?? '').trim();
      return text ? text : null;
    };

    return {
      id: Number(raw?.id ?? raw?.Id ?? raw?.interviewScheduleId ?? raw?.InterviewScheduleId ?? 0),
      userId: Number(raw?.userId ?? raw?.UserId ?? 0),
      interviewTitle: String(raw?.interviewTitle ?? raw?.InterviewTitle ?? ''),
      interviewDateTime: String(raw?.interviewDateTime ?? raw?.InterviewDateTime ?? ''),
      interviewBy: String(raw?.interviewBy ?? raw?.InterviewBy ?? ''),
      status: Number(raw?.status ?? raw?.Status ?? 0) as InterviewSchedule['status'],
      comments: toNullable(raw?.comments ?? raw?.Comments),
      recordingPath: toNullable(raw?.recordingPath ?? raw?.RecordingPath),
    };
  }
}
