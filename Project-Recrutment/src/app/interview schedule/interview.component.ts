import { Component, OnInit } from '@angular/core';
import { InterviewService, InterviewSchedule } from '../service/interview.service';

@Component({
  selector: 'app-interview',
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.css']
})
export class InterviewComponent implements OnInit {

  userId: number = 1;

  interviewList: InterviewSchedule[] = [];

  interview: InterviewSchedule = this.getEmptyModel();

  isEditMode: boolean = false;

  constructor(private interviewService: InterviewService) {}

  ngOnInit(): void {
    this.loadInterviews();
  }

  getEmptyModel(): InterviewSchedule {
    return {
      id: 0,
      userId: this.userId,
      interviewTitle: '',
      interviewDateTime: '',
      interviewBy: '',
      status: 0,
      comments: '',
      recordingPath: ''
    };
  }

  loadInterviews(): void {
    this.interviewService.getByUser(this.userId).subscribe({
      next: (data) => this.interviewList = data,
      error: (err) => console.error(err)
    });
  }

  onSubmit(): void {

    if (!this.interview.interviewTitle ||
        !this.interview.interviewDateTime ||
        !this.interview.interviewBy) {
      alert('Please fill required fields');
      return;
    }

    this.interview.userId = this.userId;

    if (this.isEditMode) {
      this.updateInterview();
    } else {
      this.insertInterview();
    }
  }

  insertInterview(): void {
    this.interviewService.insert(this.interview).subscribe({
      next: () => {
        alert('Interview Scheduled Successfully');
        this.resetForm();
        this.loadInterviews();
      },
      error: (err) => console.error(err)
    });
  }

  updateInterview(): void {
    this.interviewService.update(this.interview).subscribe({
      next: () => {
        alert('Interview Updated Successfully');
        this.resetForm();
        this.loadInterviews();
      },
      error: (err) => console.error(err)
    });
  }

  editRecord(data: InterviewSchedule): void {
    this.isEditMode = true;

    this.interview = {
      ...data,
      interviewDateTime: this.formatDateTime(data.interviewDateTime)
    };
  }

  deleteRecord(id: number): void {
    if (!confirm('Are you sure?')) return;

    this.interviewService.delete(id).subscribe({
      next: () => {
        alert('Deleted Successfully');
        this.loadInterviews();
      }
    });
  }

  resetForm(): void {
    this.isEditMode = false;
    this.interview = this.getEmptyModel();
  }

  formatDateTime(date: any): string {
    if (!date) return '';
    return new Date(date).toISOString().slice(0,16);
  }
}