import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import {
  InterviewSchedule,
  InterviewStatus,
  InterviewStatusLabels,
  InterviewStatusClasses
} from './interview-schedule.model';
import { InterviewScheduleService } from './interview-schedule.service';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-interview-schedule-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './interview-schedule-list.component.html',
  styleUrls: ['./interview-schedule-list.component.css'],
})
export class InterviewScheduleListComponent implements OnInit {
  interviews: InterviewSchedule[] = [];
  filtered: InterviewSchedule[] = [];
  searchQuery = '';
  isLoading = false;
  errorMsg = '';

  currentUserId = 0;
  currentUserRole = '';

  // Delete confirm
  showDeleteModal = false;
  deleteTargetId: number | null = null;

  // Toast
  toastMessage = '';
  toastVisible = false;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  // Expose maps/enums to template
  StatusLabels = InterviewStatusLabels as Record<number, string>;
  StatusClasses = InterviewStatusClasses as Record<number, string>;
  InterviewStatus = InterviewStatus;

  // Stats
  get totalCount(): number { return this.interviews.length; }
  get scheduledCount(): number {
    return this.interviews.filter(i => Number(i.status) === InterviewStatus.Scheduled).length;
  }
  get completedCount(): number {
    return this.interviews.filter(i => Number(i.status) === InterviewStatus.Completed).length;
  }
  get cancelledCount(): number {
    return this.interviews.filter(i => Number(i.status) === InterviewStatus.Cancelled).length;
  }

  constructor(
    private readonly service: InterviewScheduleService,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user?.id) {
      this.currentUserId = Number(user.id);
      this.currentUserRole = String(user.role ?? '');
      this.loadData();
      return;
    }

    // Fallback for stale in-memory auth state after page refresh
    try {
      const stored = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      const parsed = stored ? JSON.parse(stored) : null;
      const fallbackId = Number(parsed?.id ?? parsed?.userId ?? 0);
      if (fallbackId > 0) {
        this.currentUserId = fallbackId;
        this.currentUserRole = String(parsed?.role ?? '');
        this.loadData();
        return;
      }
    } catch {}

    this.errorMsg = 'Please login first.';
    this.router.navigate(['/login']);
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMsg = '';

    const role = this.currentUserRole.toLowerCase();
    const isHrOrAdmin = role === 'hr' || role === 'admin';
    const source$ = isHrOrAdmin
      ? this.service.getAll()
      : this.service.getByUserId(this.currentUserId);

    source$.subscribe({
      next: (response: any) => {
        const rows = this.extractRows(response);
        this.interviews = rows.map((row: any) => this.normalizeSchedule(row));
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading interviews:', err);
        this.errorMsg = this.extractErrorMessage(err, 'Failed to load interviews. Please try again.');
        this.interviews = [];
        this.filtered = [];
        this.isLoading = false;
      },
    });
  }

  onSearch(): void {
    this.applyFilter();
  }

  navigateToAdd(): void {
    sessionStorage.removeItem('editSchedule');
    this.router.navigate(['/interview-schedule/add']);
  }

  navigateToEdit(id: number): void {
    const row = this.interviews.find(i => i.id === id);
    if (row) {
      sessionStorage.setItem('editSchedule', JSON.stringify(row));
    }
    this.router.navigate(['/interview-schedule/edit', id]);
  }

  openDeleteModal(id: number): void {
    this.deleteTargetId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteTargetId = null;
  }

  confirmDelete(): void {
    if (this.deleteTargetId === null) return;

    this.service.delete(this.deleteTargetId).subscribe({
      next: () => {
        this.interviews = this.interviews.filter(i => i.id !== this.deleteTargetId);
        this.applyFilter();
        this.closeDeleteModal();
        this.showToast('Interview deleted successfully');
      },
      error: (err: any) => {
        console.error('Error deleting interview:', err);
        this.closeDeleteModal();
        this.showToast('Failed to delete interview');
      },
    });
  }

  formatDate(dtStr: string): string {
    if (!dtStr) return '-';
    return new Date(dtStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  formatTime(dtStr: string): string {
    if (!dtStr) return '';
    return new Date(dtStr).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  }

  initials(title: string): string {
    return title?.trim()?.[0]?.toUpperCase() || 'I';
  }

  showToast(msg: string): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastMessage = msg;
    this.toastVisible = true;
    this.toastTimer = setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }

  private applyFilter(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filtered = q
      ? this.interviews.filter(i =>
          (i.interviewTitle ?? '').toLowerCase().includes(q) ||
          (i.interviewBy ?? '').toLowerCase().includes(q)
        )
      : [...this.interviews];
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
      status: Number(raw?.status ?? raw?.Status ?? InterviewStatus.Scheduled) as InterviewSchedule['status'],
      comments: toNullable(raw?.comments ?? raw?.Comments),
      recordingPath: toNullable(raw?.recordingPath ?? raw?.RecordingPath),
    };
  }

  private extractErrorMessage(err: any, fallback: string): string {
    return (
      err?.error?.message ||
      err?.error?.title ||
      err?.error?.error ||
      err?.message ||
      fallback
    );
  }
}
