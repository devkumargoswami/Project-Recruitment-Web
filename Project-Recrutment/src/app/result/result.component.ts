import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResultService } from '../service/result.service';
import { Result } from '../result/result.model';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {

  results: Result[] = [];
  resultForm!: FormGroup;
  loading = false;
  submitting = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private resultService: ResultService
  ) {}

  ngOnInit(): void {

    this.resultForm = this.fb.group({
      result_id: ['', Validators.required],
      candidate_id: ['', Validators.required],
      technical_marks: ['', Validators.required],
      hr_marks: ['', Validators.required]
    });

  }

  onSubmit() {

    if (this.resultForm.invalid) return;

    this.submitting = true;

    const result: Result = this.resultForm.value;

    this.resultService.insertResult(result).subscribe({
      next: () => {

        alert("Result Added Successfully");

        this.resultForm.reset();
        this.submitting = false;

      },
      error: () => {

        this.error = "Error adding result";
        this.submitting = false;

      }
    });

  }

  loadResults(candidateId: number) {

    this.loading = true;

    this.resultService.getResultByCandidate(candidateId).subscribe({
      next: (data) => {

        this.results = data;
        this.loading = false;

      },
      error: () => {

        this.error = "Failed to load results";
        this.loading = false;

      }
    });

  }

}