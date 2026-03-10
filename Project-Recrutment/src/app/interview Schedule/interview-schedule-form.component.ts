import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { InterviewScheduleService } from './interview-schedule.service';

@Component({
  selector: 'app-interview-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './interview-schedule-form.component.html',
  styleUrls: ['./interview-schedule-form.component.css']
})
export class InterviewScheduleComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  userId = 0;
  isEditMode = false;
  isLoading = true;
  isSaving = false;
  errorMsg = '';
  private editId = 0;

  readonly form = this.fb.nonNullable.group({
    userId: [0, [Validators.required, Validators.min(1)]],
    interviewTitle: ['', [Validators.required, Validators.minLength(3)]],
    interviewDateTime: ['', [Validators.required]],
    interviewBy: ['', [Validators.required]],
    status: [1, [Validators.required]],
    comments: [''],
    recordingPath: ['']
  });

    // Allowed statuses: 1=Scheduled, 2=Completed, 3=Cancelled
  readonly statusOptions = [
    { value: 1, label: 'Scheduled' },
    { value: 2, label: 'Completed' },
    { value: 3, label: 'Cancelled' }
  ];

  get f() {
    return this.form.controls;
  }

  constructor(
    private readonly service: InterviewScheduleService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (!user?.id) {
      this.errorMsg = 'Please login first.';
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    this.userId = user.id;
    this.form.patchValue({ userId: this.userId });

    const routeId = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isFinite(routeId) && routeId > 0) {
      this.isEditMode = true;
      this.editId = routeId;
      this.service.getById(routeId).subscribe({
        next: (editData) => {
          this.form.patchValue({
            userId: Number(editData.userId ?? this.userId),
            interviewTitle: editData.interviewTitle ?? '',
            interviewDateTime: this.toDateTimeLocal(editData.interviewDateTime),
            interviewBy: editData.interviewBy ?? '',
            status: Number(editData.status ?? 1),
            comments: editData.comments ?? '',
            recordingPath: editData.recordingPath ?? ''
          });
          this.isLoading = false;
        },
        error: (err: any) => {
          this.errorMsg = this.extractErrorMessage(err, 'Failed to load interview for edit.');
          this.isLoading = false;
        }
      });
      return;
    }

    const editRaw = sessionStorage.getItem('editSchedule');
    if (editRaw) {
      try {
        const editData = JSON.parse(editRaw);
        this.isEditMode = true;
        this.editId = editData.id;
        this.form.patchValue({
          userId: Number(editData.userId ?? this.userId),
          interviewTitle: editData.interviewTitle ?? '',
          interviewDateTime: this.toDateTimeLocal(editData.interviewDateTime),
          interviewBy: editData.interviewBy ?? '',
          status: Number(editData.status ?? 1),  // ✅ Number ensure
          comments: editData.comments ?? '',
          recordingPath: editData.recordingPath ?? ''
        });
      } catch {
        sessionStorage.removeItem('editSchedule');
      }
    }

    this.isLoading = false;
  }

  onSubmit(): void {
    this.errorMsg = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const value = this.form.getRawValue();

    const payload = {
      id: this.isEditMode ? this.editId : 0,
      userId: Number(value.userId),
      interviewTitle: value.interviewTitle.trim(),
      interviewDateTime: this.toApiDateTime(value.interviewDateTime),
      interviewBy: value.interviewBy.trim(),
      status: Number(value.status),  // ✅ Always number
      comments: value.comments?.trim() || null,
      recordingPath: value.recordingPath?.trim() || null
    };

    if (this.isEditMode) {
      this.service.update(payload).subscribe({
        next: () => {
          this.isSaving = false;
          sessionStorage.removeItem('editSchedule');
          this.router.navigate(['/interview-schedule/list']);
        },
        error: (err: any) => {
          this.isSaving = false;
          this.errorMsg = this.extractErrorMessage(err, 'Failed to update interview. Please try again.');
        }
      });
    } else {
        // Allowed statuses: 1=Scheduled, 2=Completed, 3=Cancelled
      const insertPayload = {
        userId: payload.userId,
        interviewTitle: payload.interviewTitle,
        interviewDateTime: payload.interviewDateTime,
        interviewBy: payload.interviewBy,
        status: Number(payload.status),  // ✅ Fixed — String nahi, Number
        comments: payload.comments,
        recordingPath: payload.recordingPath
      };

      this.service.insert(insertPayload).subscribe({
        next: () => {
          this.isSaving = false;
          this.form.reset({
            userId: this.userId,
            interviewTitle: '',
            interviewDateTime: '',
            interviewBy: '',
            status: 1,  // ✅ Reset to Scheduled
            comments: '',
            recordingPath: ''
          });
          this.router.navigate(['/interview-schedule/list']);
        },
        error: (err: any) => {
          this.isSaving = false;
          this.errorMsg = this.extractErrorMessage(err, 'Failed to schedule interview. Please try again.');
        }
      });
    }
  }

  goBack(): void {
    sessionStorage.removeItem('editSchedule');
    this.router.navigate(['/interview-schedule/list']);
  }

  private toDateTimeLocal(value: string | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const mins = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${mins}`;
  }

  private toApiDateTime(value: string): string {
    if (!value) return value;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const mins = pad(date.getMinutes());
    const secs = pad(date.getSeconds());
    return `${year}-${month}-${day}T${hours}:${mins}:${secs}`;
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



