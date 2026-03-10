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
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.resultId = +params['id'];
        this.loadResult(this.resultId);
      }
    });
  }

  loadResult(id: number): void {
    // For editing, we need to get the specific result by result_id
    // Since we don't have a direct API for this, we'll use GetAllResult and filter
    this.resultService.getAllResults().subscribe({
      next: (results: Result[]) => {
        // Find the specific result by result_id
        const result = results.find(r => r.result_id === id);
        if (result) {
          this.resultForm.patchValue({
            candidate_id: result.candidate_id,
            technical_marks: result.technical_marks,
            hr_marks: result.hr_marks
          });
        } else {
          console.error('Result not found for editing:', id);
          this.router.navigate(['/results']);
        }
      },
      error: (err) => {
        console.error('Error loading result for editing:', err);
        this.router.navigate(['/results']);
      }
    });
  }

  onSubmit(): void {
    if (this.resultForm.invalid || this.submitting) {
      return;
    }

    this.submitting = true;
    const resultData = {
      candidate_id: this.resultForm.value.candidate_id,
      technical_marks: this.resultForm.value.technical_marks,
      hr_marks: this.resultForm.value.hr_marks
    };

    if (this.isEditing && this.resultId) {
      // Update existing result
      const updateData: Result = {
        result_id: this.resultId,
        candidate_id: resultData.candidate_id,
        technical_marks: resultData.technical_marks,
        hr_marks: resultData.hr_marks
      };
      this.resultService.updateResult(updateData).subscribe({
        next: (response: any) => {
          this.submitting = false;
          console.log('Result updated successfully:', response);
          // Navigate back to results list after successful update
          this.router.navigate(['/results']);
        },
        error: (err: any) => {
          this.submitting = false;
          console.error('Error updating result:', err);
        }
      });
    } else {
      // Insert new result - use any type to bypass result_id requirement for insertion
      this.resultService.insertResult(resultData as any).subscribe({
        next: (response: any) => {
          this.submitting = false;
          console.log('Result added successfully:', response);
          // Navigate back to results list after successful addition
          this.router.navigate(['/results']);
        },
        error: (err: any) => {
          this.submitting = false;
          console.error('Error inserting result:', err);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/results']);
  }
}
