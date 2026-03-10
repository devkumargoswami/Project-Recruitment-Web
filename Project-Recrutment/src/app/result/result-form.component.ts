import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ResultService } from '../service/result.service';
import { AuthService } from '../service/auth.service';
import { Result } from './result.model';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './result-form.component.html',
  styleUrls: ['./result-form.component.css']
})
export class ResultComponent implements OnInit {
  resultForm!: FormGroup;
  submitting = false;
  error = '';
  isEditMode = false;
  get isEditing(): boolean { return this.isEditMode; }

  constructor(
    private fb: FormBuilder,
    private resultService: ResultService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    if (user.role !== 'HR' && user.role !== 'Admin') {
      this.error = 'Only HR/Admin can access this form.';
      return;
    }

    this.resultForm = this.fb.group({
      result_id: [0, [Validators.required, Validators.min(0)]],
      candidate_id: [0, [Validators.required, Validators.min(1)]],
      technical_marks: [0, [Validators.required, Validators.min(0)]],
      hr_marks: [0, [Validators.required, Validators.min(0)]]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.resultForm.patchValue({ result_id: Number(idParam) });
    }
  }

  onSubmit(): void {
    if (!this.resultForm || this.resultForm.invalid) {
      this.resultForm?.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = '';

    const payload = this.resultForm.value as Result;
    const call = this.isEditMode
      ? this.resultService.updateResult(payload)
      : this.resultService.insertResult(payload);

    call.subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/results']);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err?.error?.message ?? 'Failed to save result.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/results']);
  }
}
