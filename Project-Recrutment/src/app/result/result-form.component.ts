import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ResultService } from '../service/result.service';
import { Result } from '../result/result.model';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './result-form.component.html',
  styleUrls: ['./result-form.component.css']
})
export class ResultComponent implements OnInit {
  resultForm: FormGroup;
  isEditing = false;
  resultId: number | null = null;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private resultService: ResultService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resultForm = this.fb.group({
      candidate_id: ['', [Validators.required, Validators.min(1)]],
      technical_marks: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      hr_marks: ['', [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

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
    // For editing, you would load the result data here
    // This is a placeholder - you would need to implement the actual loading logic
    console.log('Loading result for editing:', id);
  }

  onSubmit(): void {
    if (this.resultForm.invalid) {
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
        next: () => {
          this.submitting = false;
          this.router.navigate(['/results']);
        },
        error: (err) => {
          console.error('Error updating result:', err);
          this.submitting = false;
        }
      });
    } else {
      // Insert new result - use any type to bypass result_id requirement for insertion
      this.resultService.insertResult(resultData as any).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/results']);
        },
        error: (err) => {
          console.error('Error inserting result:', err);
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/results']);
  }
}
