import { Component, OnInit } from '@angular/core';
import { InterviewScheduleService, InterviewSchedule } from '../service/interview-schedule.service';

@Component({
  selector: 'app-interview-schedule',
  templateUrl: './interview-schedule.component.html',
  styleUrls: ['./interview-schedule.component.css']
})
export class InterviewScheduleComponent implements OnInit {

  userId: number = 1;
  schedule: InterviewSchedule = this.getEmpty();
  isEditMode: boolean = false;

  statusOptions = [
    { value: 1, label: 'Scheduled' },
    { value: 2, label: 'Completed' },
    { value: 3, label: 'Cancelled' },
    { value: 4, label: 'Rescheduled' }
  ];

  constructor(private service: InterviewScheduleService) {}

  ngOnInit(): void {}

  getEmpty(): InterviewSchedule {
    return {
      id: 0,
      userId: this.userId,
      interviewTitle: '',
      interviewDateTime: '',
      interviewBy: '',
      status: 1,
      comments: null,
      recordingPath: null
    };
  }

  onSubmit(): void {
    if (!this.schedule.interviewTitle ||
        !this.schedule.interviewDateTime ||
        !this.schedule.interviewBy) {
      alert('Please fill all required fields');
      return;
    }

    this.schedule.userId = this.userId;

    if (this.isEditMode) {
      this.service.update(this.schedule).subscribe({
        next: () => { alert('Updated Successfully'); this.reset(); },
        error: (err) => console.error('Update Error:', err)
      });
    } else {
      this.service.insert(this.schedule).subscribe({
        next: () => { alert('Scheduled Successfully'); this.reset(); },
        error: (err) => console.error('Insert Error:', err)
      });
    }
  }

  reset(): void {
    this.isEditMode = false;
    this.schedule = this.getEmpty();
  }
}