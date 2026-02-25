import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EducationService } from '../service/education.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent {

  educationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private educationService: EducationService,
    private router: Router
  ) {
    this.educationForm = this.fb.group({
      userId: ['', Validators.required],
      educationLevelId: ['', Validators.required],
      schoolCollege: ['', Validators.required],
      boardUniversity: ['', Validators.required],
      degree: ['', Validators.required],
      startMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
      startYear: ['', Validators.required],
      endMonth: [''],
      endYear: [''],
      isContinue: [false]
    });
  }

  onSubmit() {
    if (this.educationForm.invalid) return;

    this.educationService.insert(this.educationForm.value).subscribe({
      next: () => {
        alert('Education saved successfully');
        this.router.navigate(['/documents']);   // next step
      },
      error: () => alert('Failed to save education')
    });
  }
}