import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExperienceService } from './experience.service';
import { ExperienceModel, ApiResponse } from './experience.model';

@Component({
  selector: 'app-experience-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './experience-list.component.html',
  styleUrls: ['./experience-list.component.css']
})
export class ExperienceListComponent {
  experiences: ExperienceModel[] = [];
  loading = false;
  error: string | null = null;

  newExperience: ExperienceModel = {
    id: 0, userId: 0, companyName: '', designation: '',
    startDate: '', endDate: '', isCurrent: false
  };

  searchId: number | null = null;
  searchUserId: number | null = null;
  isAddModalOpen = false;

  constructor(private experienceService: ExperienceService) {}

  openAddModal() {
    this.isAddModalOpen = true;
    this.newExperience = {
      id: 0, userId: 0, companyName: '', designation: '',
      startDate: '', endDate: '', isCurrent: false
    };
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    this.newExperience = {
      id: 0, userId: 0, companyName: '', designation: '',
      startDate: '', endDate: '', isCurrent: false
    };
  }

  addExperience() {
    if (typeof this.newExperience.userId === 'string') {
      this.newExperience.userId = parseInt(this.newExperience.userId, 10);
    }
    this.newExperience.companyName = this.newExperience.companyName.trim();
    this.newExperience.designation = this.newExperience.designation.trim();

    if (!this.newExperience.userId || !this.newExperience.companyName ||
        !this.newExperience.designation || !this.newExperience.startDate) {
      this.error = 'Please fill in all required fields';
      return;
    }

    if (this.newExperience.isCurrent) {
      this.newExperience.endDate = null;
    }

    this.loading = true;
    this.error = null;
    this.newExperience.id = 0;

    this.experienceService.insertExperience(this.newExperience).subscribe({
      next: (response: ApiResponse) => {
        this.loading = false;
        if (response.status === 200) {
          this.closeAddModal();
          this.getExperiences();
        } else {
          this.error = response.message || 'Failed to add experience';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error adding experience: ' + err.message;
      }
    });
  }

  getExperiences() {
    this.loading = true;
    this.error = null;

    this.experienceService.getExperiences().subscribe({
      next: (data: ExperienceModel[]) => {
        this.loading = false;
        this.experiences = data;
        this.error = null;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error loading experiences: ' + err.message;
      }
    });
  }

  searchExperience() {
    this.loading = true;
    this.error = null;

    this.experienceService.searchExperience(
      this.searchId || undefined,
      this.searchUserId || undefined
    ).subscribe({
      next: (data: ExperienceModel[]) => {
        this.loading = false;
        this.experiences = data;
        if (data.length === 0) {
          this.error = 'No experiences found';
        } else {
          this.error = null;
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error searching experiences: ' + err.message;
      }
    });
  }

  deleteExperience(id: number) {
    if (confirm('Are you sure you want to delete this experience?')) {
      this.loading = true;
      this.error = null;

      this.experienceService.deleteExperience(id).subscribe({
        next: (response: ApiResponse) => {
          this.loading = false;
          if (response.status === 200) {
            this.getExperiences();
          } else {
            this.error = response.message || 'Failed to delete experience';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error deleting experience: ' + err.message;
        }
      });
    }
  }
}