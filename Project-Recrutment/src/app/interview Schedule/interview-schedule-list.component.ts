import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterviewScheduleService, InterviewSchedule } from '../service/interview-schedule.service';

@Component({
  selector: 'app-interview-schedule-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interview-schedule-list.component.html',
  styleUrls: ['./interview-schedule-list.component.css']
})
export class InterviewScheduleListComponent implements OnInit {

  userId: number = 1;
  scheduleList: InterviewSchedule[] = [];

  statusOptions = [
    { value: 1, label: 'Scheduled' },
    { value: 2, label: 'Completed' },
    { value: 3, label: 'Cancelled' },
    { value: 4, label: 'Rescheduled' }
  ];

  constructor(private service: InterviewScheduleService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.service.getByUserId(this.userId).subscribe({
      next: (data) => this.scheduleList = data,
      error: (err) => console.error('Load Error:', err)
    });
  }

  deleteRecord(id: number): void {
    if (!confirm('Are you sure?')) return;
    this.service.delete(id).subscribe({
      next: () => { alert('Deleted Successfully'); this.loadData(); },
      error: (err) => console.error('Delete Error:', err)
    });
  }

  getStatusLabel(status: number): string {
    return this.statusOptions.find(s => s.value === status)?.label || 'Unknown';
  }

  getStatusClass(status: number): string {
    switch(status) {
      case 1: return 'scheduled';
      case 2: return 'completed';
      case 3: return 'cancelled';
      case 4: return 'rescheduled';
      default: return '';
    }
  }

  formatDisplay(date: any): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}