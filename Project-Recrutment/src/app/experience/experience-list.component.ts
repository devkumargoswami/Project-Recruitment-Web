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
  successMessage: string | null = null;

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
    this.error = null;
    this.newExperience = {
      id: 0, userId: 0, companyName: '', designation: '',
      startDate: '', endDate: '', isCurrent: false
    };
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    this.error = null;
    this.newExperience = {
      id: 0, userId: 0, companyName: '', designation: '',
      startDate: '', endDate: '', isCurrent: false
    };
  }

  // ✅ ADD
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

    if (this.newExperience.isCurrent) this.newExperience.endDate = null;

    this.loading = true;
    this.error = null;
    this.newExperience.id = 0;

    this.experienceService.insertExperience(this.newExperience).subscribe({
      next: (response: ApiResponse) => {
        this.loading = false;
        this.closeAddModal();
        this.successMessage = 'Experience added successfully!';
        this.getExperiences();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error adding experience: ' + err.message;
      }
    });
  }

  // ✅ UPDATE
  updateExperience() {
    if (typeof this.newExperience.userId === 'string') {
      this.newExperience.userId = parseInt(this.newExperience.userId, 10);
    }

    if (!this.newExperience.userId || !this.newExperience.companyName ||
        !this.newExperience.designation || !this.newExperience.startDate) {
      this.error = 'Please fill in all required fields';
      return;
    }

    if (this.newExperience.isCurrent) this.newExperience.endDate = null;

    this.loading = true;
    this.error = null;

    const formData = {
      experienceId: this.newExperience.id,
      userId: this.newExperience.userId,
      companyName: this.newExperience.companyName,
      designation: this.newExperience.designation,
      startDate: this.newExperience.startDate,
      endDate: this.newExperience.endDate,
      isCurrent: this.newExperience.isCurrent
    };

    this.experienceService.updateExperience(formData as any).subscribe({
      next: (response: ApiResponse) => {
        this.loading = false;
        this.closeAddModal();
        this.successMessage = 'Experience updated successfully!';
        this.getExperiences();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error updating experience: ' + err.message;
      }
    });
  }

  // ✅ EDIT - open modal with existing data
  editExperience(id: number) {
    const exp = this.experiences.find(e => e.id === id);
    if (!exp) { this.error = 'Experience not found'; return; }
    this.newExperience = { ...exp };
    this.isAddModalOpen = true;
    this.error = null;
  }

  // ✅ GET ALL
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

  // ✅ SEARCH
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
        this.error = data.length === 0 ? 'No experiences found' : null;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error searching experiences: ' + err.message;
      }
    });
  }

  // ✅ DELETE
  deleteExperience(id: number) {
    if (confirm('Are you sure you want to delete this experience?')) {
      this.loading = true;
      this.error = null;

      this.experienceService.deleteExperience(id).subscribe({
        next: (response: ApiResponse) => {
          this.loading = false;
          this.successMessage = 'Experience deleted successfully!';
          this.getExperiences();
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error deleting experience: ' + err.message;
        }
      });
    }
  }
}