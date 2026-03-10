import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { InterviewScheduleService } from './interview-schedule.service';
import { InterviewSchedule } from './interview-schedule.model';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-interview-schedule-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './interview-schedule-list.component.html',
  styleUrls: ['./interview-schedule-list.component.css']
})
export class InterviewScheduleListComponent implements OnInit {
  schedules: InterviewSchedule[] = [];
  searchTerm = '';
  isLoading = false;
  currentUserId = 0;
  currentUserRole = '';

  constructor(
    private service: InterviewScheduleService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    if (user?.id) {
      this.currentUserId = Number(user.id);
      this.currentUserRole = String(user.role ?? '');
      this.loadSchedules();
      return;
    }

    // Fallback for refresh when in-memory auth is empty
    try {
      const stored = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      const parsed = stored ? JSON.parse(stored) : null;
      const fallbackId = Number(parsed?.id ?? parsed?.userId ?? 0);
      if (fallbackId > 0) {
        this.currentUserId = fallbackId;
        this.currentUserRole = String(parsed?.role ?? '');
        this.loadSchedules();
        return;
      }
    } catch {}

    alert('Please login first');
    this.router.navigate(['/login']);
  }

  loadSchedules() {
    this.isLoading = true;
    const role = this.currentUserRole.toLowerCase();
    const isHrOrAdmin = role === 'hr' || role === 'admin';
    const source$ = isHrOrAdmin
      ? this.service.getAll()
      : this.service.getByUserId(this.currentUserId);

    source$.subscribe(
      (response: any) => {
        const rows = this.extractRows(response);
        this.schedules = rows.map((row: any) => this.normalizeSchedule(row));
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error loading schedules:', error);
        this.isLoading = false;
        alert('Failed to load schedules');
      }
    );
  }

  get filteredSchedules() {
    if (!this.searchTerm) return this.schedules;

    const term = this.searchTerm.toLowerCase();
    return this.schedules.filter(s =>
      s.interviewTitle?.toLowerCase().includes(term) ||
      s.interviewBy?.toLowerCase().includes(term)
    );
  }

  onEdit(schedule: InterviewSchedule) {
    sessionStorage.setItem('editSchedule', JSON.stringify(schedule));
    this.router.navigate(['/interview-schedule/edit', schedule.id]);
  }

  onDelete(schedule: InterviewSchedule) {
    if (confirm(`Delete interview "${schedule.interviewTitle}"?`)) {
      this.service.delete(schedule.id).subscribe(
        () => {
          alert('Interview deleted successfully!');
          this.loadSchedules();
        },
        (error: any) => {
          console.error('Error deleting:', error);
          alert('Failed to delete interview');
        }
      );
    }
  }

  onAddNew() {
    sessionStorage.removeItem('editSchedule');
    this.router.navigate(['/interview-schedule/add']);
  }

  getStatusLabel(status: number | string): string {
    const key = Number(status);
    const statusMap: Record<number, string> = {
      1: 'Scheduled',
      2: 'Completed',
      3: 'Cancelled'
    };
    return statusMap[key] || 'Unknown';
  }

  getStatusClass(status: number | string): string {
    const key = Number(status);
    const classMap: Record<number, string> = {
      1: 'scheduled',
      2: 'completed',
      3: 'cancelled'
    };
    return classMap[key] || 'scheduled';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  getTitleBadge(title: string): string {
    const value = (title || '').trim();
    if (!value) return 'IV';
    return value.slice(0, 2).toUpperCase();
  }

  get totalSchedules(): number {
    return this.schedules.length;
  }

  get upcomingSchedules(): number {
    return this.schedules.filter(s => Number(s.status) === 1).length;
  }

  get completedSchedules(): number {
    return this.schedules.filter(s => Number(s.status) === 2).length;
  }

  trackBySchedule(index: number, schedule: InterviewSchedule) {
    return schedule.id;
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
      status: Number(raw?.status ?? raw?.Status ?? 1) as InterviewSchedule['status'],
      comments: toNullable(raw?.comments ?? raw?.Comments),
      recordingPath: toNullable(raw?.recordingPath ?? raw?.RecordingPath),
    };
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
    return [];
  }
}
