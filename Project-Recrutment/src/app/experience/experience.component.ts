import { Component, OnInit } from '@angular/core';
import { ExperienceService } from '../service/experience.service';

/* 🔹 Experience Model */
export interface Experience {
  experienceId: number;
  userId: number;
  companyName: string;
  designation: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css']
})
export class ExperienceComponent implements OnInit {

  userId: number = 1;

  experienceList: Experience[] = [];

  experience: Experience = this.getEmptyExperience();

  isEditMode: boolean = false;

  constructor(private expService: ExperienceService) { }

  ngOnInit(): void {
    this.loadExperiences();
  }

  // 🔹 Empty Model
  getEmptyExperience(): Experience {
    return {
      experienceId: 0,
      userId: this.userId,
      companyName: '',
      designation: '',
      startDate: '',
      endDate: null,
      isCurrent: false
    };
  }

  // 🔹 Load Data
  loadExperiences(): void {
    this.expService.getExperiences(this.userId).subscribe({
      next: (data: Experience[]) => {
        this.experienceList = data;
      },
      error: (err: any) => {
        console.error('Load Error:', err);
      }
    });
  }

  // 🔹 Submit
  onSubmit(): void {

    if (!this.experience.companyName ||
        !this.experience.designation ||
        !this.experience.startDate) {
      alert('Please fill all required fields');
      return;
    }

    this.experience.userId = this.userId;

    if (this.experience.isCurrent) {
      this.experience.endDate = null;
    }

    if (this.isEditMode) {
      this.updateExperience();
    } else {
      this.insertExperience();
    }
  }

  // 🔹 Insert
  insertExperience(): void {
    this.expService.insertExperience(this.experience).subscribe({
      next: () => {
        alert('Experience Added Successfully');
        this.resetForm();
        this.loadExperiences();
      },
      error: (err: any) => {
        console.error('Insert Error:', err);
      }
    });
  }

  // 🔹 Update
  updateExperience(): void {
    this.expService.updateExperience(this.experience).subscribe({
      next: () => {
        alert('Experience Updated Successfully');
        this.resetForm();
        this.loadExperiences();
      },
      error: (err: any) => {
        console.error('Update Error:', err);
      }
    });
  }

  // 🔹 Edit
  editRecord(exp: Experience): void {
    this.isEditMode = true;

    this.experience = {
      ...exp,
      startDate: this.formatDate(exp.startDate),
      endDate: exp.endDate ? this.formatDate(exp.endDate) : null
    };
  }

  // 🔹 Delete
  deleteRecord(id: number): void {
    if (!confirm('Are you sure you want to delete this record?')) return;

    this.expService.deleteExperience(id).subscribe({
      next: () => {
        alert('Deleted Successfully');
        this.loadExperiences();
      },
      error: (err: any) => {
        console.error('Delete Error:', err);
      }
    });
  }

  // 🔹 Reset
  resetForm(): void {
    this.isEditMode = false;
    this.experience = this.getEmptyExperience();
  }

  // 🔹 Current Checkbox
  onCurrentChange(): void {
    if (this.experience.isCurrent) {
      this.experience.endDate = null;
    }
  }

  // 🔹 Format Date
  formatDate(date: any): string {
    if (!date) return '';
    return new Date(date).toISOString().substring(0, 10);
  }
}