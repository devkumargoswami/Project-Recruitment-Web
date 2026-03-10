import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { InterviewScheduleService, InterviewSchedule } from '../service/interview-schedule.service';
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
    if (user) {
      this.currentUserId = user.id;
      this.currentUserRole = user.role;
      this.loadSchedules();
    } else {
      alert('Please login first');
      this.router.navigate(['/login']);
    }
  }

  loadSchedules() {
    this.isLoading = true;
    
    if (this.currentUserRole === 'HR' || this.currentUserRole === 'Admin') {
      this.service.getAll().subscribe(
        (data: InterviewSchedule[]) => {
          this.schedules = data || [];
          this.isLoading = false;
        },
        (error: any) => {
          console.error('Error loading schedules:', error);
          this.isLoading = false;
          alert('Failed to load schedules');
        }
      );
    } else {
      this.service.getByUserId(this.currentUserId).subscribe(
        (data: InterviewSchedule[]) => {
          this.schedules = data || [];
          this.isLoading = false;
        },
        (error: any) => {
          console.error('Error loading schedules:', error);
          this.isLoading = false;
          alert('Failed to load schedules');
        }
      );
    }
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
    this.router.navigate(['/interview-schedule']);
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
    this.router.navigate(['/interview-schedule']);
  }

  getStatusLabel(status: number): string {
    const statusMap: Record<number, string> = {
      0: 'Pending',
      1: 'Scheduled',
      2: 'Completed',
      3: 'Cancelled'
    };
    return statusMap[status] || 'Unknown';
  }

  getStatusClass(status: number): string {
    const classMap: Record<number, string> = {
      0: 'status-pending',
      1: 'status-scheduled',
      2: 'status-completed',
      3: 'status-cancelled'
    };
    return classMap[status] || 'status-pending';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  get totalSchedules(): number {
    return this.schedules.length;
  }

  get upcomingSchedules(): number {
    return this.schedules.filter(s => s.status === 1).length;
  }

  get completedSchedules(): number {
    return this.schedules.filter(s => s.status === 2).length;
  }

  trackBySchedule(index: number, schedule: InterviewSchedule) {
    return schedule.id;
  }
}