import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EducationService, Education } from '../service/education.service';

interface ApiResponse {
  status: number;
  message: string;
  data?: any;
}

@Component({
  selector: 'app-education-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './education-list.component.html',
  styleUrls: ['./education-list.component.css']
})
export class EducationListComponent {
  educationList: Education[] = [];
  loading = false;
  error: string | null = null;
  
  // Form fields for adding new education
  newEducation: Education = { 
    educationId: 0, 
    userId: 0, 
    educationLevelId: 0, 
    schoolCollege: '', 
    boardUniversity: '', 
    degree: '', 
    startMonth: 1, 
    startYear: 2020, 
    endMonth: 1, 
    endYear: 2021, 
    isContinue: false 
  };
  
  // Form fields for searching
  searchId: number | null = null;
  searchUserId: number | null = null;
  
  // Modal state
  isAddModalOpen = false;
  
  constructor(private educationService: EducationService) {}

  openAddModal() {
    this.isAddModalOpen = true;
    this.newEducation = { 
      educationId: 0, 
      userId: 0, 
      educationLevelId: 0, 
      schoolCollege: '', 
      boardUniversity: '', 
      degree: '', 
      startMonth: 1, 
      startYear: 2020, 
      endMonth: 1, 
      endYear: 2021, 
      isContinue: false 
    };
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    this.newEducation = { 
      educationId: 0, 
      userId: 0, 
      educationLevelId: 0, 
      schoolCollege: '', 
      boardUniversity: '', 
      degree: '', 
      startMonth: 1, 
      startYear: 2020, 
      endMonth: 1, 
      endYear: 2021, 
      isContinue: false 
    };
  }

  addEducation() {
    console.log('=== ADD EDUCATION BUTTON CLICKED ===');
    console.log('Form data:', this.newEducation);
    console.log('User ID type:', typeof this.newEducation.userId);
    console.log('User ID value:', this.newEducation.userId);
    console.log('School/College type:', typeof this.newEducation.schoolCollege);
    console.log('School/College value:', this.newEducation.schoolCollege);
    
    // Convert userId to number if it's a string (common issue)
    if (typeof this.newEducation.userId === 'string') {
      this.newEducation.userId = parseInt(this.newEducation.userId, 10);
      console.log('Converted userId to number:', this.newEducation.userId);
    }
    
    // Trim whitespace from fields
    this.newEducation.schoolCollege = this.newEducation.schoolCollege.trim();
    this.newEducation.degree = this.newEducation.degree.trim();
    console.log('Trimmed fields:', this.newEducation);
    
    if (!this.newEducation.userId || !this.newEducation.schoolCollege || !this.newEducation.degree) {
      this.error = 'Please fill in User ID, School/College, and Degree';
      console.log('Validation failed');
      return;
    }

    console.log('=== VALIDATION PASSED ===');
    console.log('Final data to send:', this.newEducation);
    console.log('Final data JSON:', JSON.stringify(this.newEducation));
    console.log('Proceeding with API call');
    this.loading = true;
    this.error = null;

    this.educationService.insert(this.newEducation).subscribe({
      next: (response: any) => {
        console.log('=== API CALL SUCCESSFUL ===');
        console.log('Response:', response);
        this.loading = false;
        // Check if response indicates success (handle different response formats)
        if (response && (response.status === 200 || response.success || response === null)) {
          this.error = null;
          // Close modal and clear form
          this.closeAddModal();
          // Refresh the list
          this.getEducation();
        } else if (response && response.message) {
          this.error = response.message;
        } else {
          this.error = 'Education added successfully, but response format is unexpected';
          // Still refresh the list since the operation likely succeeded
          this.closeAddModal();
          this.getEducation();
        }
      },
      error: (err: any) => {
        console.log('=== API CALL FAILED ===');
        console.log('Error details:', err);
        this.loading = false;
        this.error = 'Error adding education: ' + err.message;
      }
    });
  }

  searchEducation() {
    this.loading = true;
    this.error = null;

    if (this.searchId) {
      this.educationService.getById(this.searchId).subscribe({
        next: (data: Education) => {
          this.loading = false;
          this.educationList = data ? [data] : [];
          if (this.educationList.length === 0) {
            this.error = 'No education record found with this ID';
          } else {
            this.error = null;
          }
        },
        error: (err: any) => {
          this.loading = false;
          this.error = 'Error searching education: ' + err.message;
        }
      });
    } else if (this.searchUserId) {
      this.educationService.getByUserId(this.searchUserId).subscribe({
        next: (data: Education[]) => {
          this.loading = false;
          this.educationList = data;
          if (data.length === 0) {
            this.error = 'No education records found for this user';
          } else {
            this.error = null;
          }
        },
        error: (err: any) => {
          this.loading = false;
          this.error = 'Error searching education: ' + err.message;
        }
      });
    } else {
      this.getEducation();
    }
  }

  getEducation() {
    this.loading = true;
    this.error = null;

    // Get current user ID from localStorage or use a default
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.id || 1; // Default to 1 if no user found

    this.educationService.getByUserId(userId).subscribe({
      next: (data: Education[]) => {
        this.loading = false;
        this.educationList = data;
        this.error = null;
      },
      error: (err: any) => {
        this.loading = false;
        this.error = 'Error loading education: ' + err.message;
      }
    });
  }

  deleteEducation(id: number) {
    if (confirm('Are you sure you want to delete this education record?')) {
      this.loading = true;
      this.error = null;

      this.educationService.delete(id).subscribe({
        next: (response: any) => {
          this.loading = false;
          // Check if response indicates success (handle different response formats)
          if (response && (response.status === 200 || response.success || response === null)) {
            this.error = null;
            // Refresh the list
            this.getEducation();
          } else if (response && response.message) {
            this.error = response.message;
          } else {
            this.error = 'Education deleted successfully';
            // Still refresh the list since the operation likely succeeded
            this.getEducation();
          }
        },
        error: (err: any) => {
          this.loading = false;
          this.error = 'Error deleting education: ' + err.message;
        }
      });
    }
  }

  editEducation(edu: any) {
    // Open the add modal with the education data pre-filled
    this.isAddModalOpen = true;
    this.newEducation = {
      educationId: edu.educationId,
      userId: edu.userId,
      educationLevelId: edu.educationLevelId,
      schoolCollege: edu.schoolCollege,
      boardUniversity: edu.boardUniversity || '',
      degree: edu.degree,
      startMonth: edu.startMonth,
      startYear: edu.startYear,
      endMonth: edu.endMonth,
      endYear: edu.endYear,
      isContinue: edu.isContinue
    };
  }

  updateEducation() {
    console.log('=== UPDATE EDUCATION BUTTON CLICKED ===');
    console.log('Form data:', this.newEducation);
    
    // Convert userId to number if it's a string (common issue)
    if (typeof this.newEducation.userId === 'string') {
      this.newEducation.userId = parseInt(this.newEducation.userId, 10);
      console.log('Converted userId to number:', this.newEducation.userId);
    }
    
    // Trim whitespace from fields
    this.newEducation.schoolCollege = this.newEducation.schoolCollege?.trim() || '';
    this.newEducation.degree = this.newEducation.degree?.trim() || '';
    console.log('Trimmed fields:', this.newEducation);
    
    if (!this.newEducation.userId || !this.newEducation.schoolCollege || !this.newEducation.degree) {
      this.error = 'Please fill in User ID, School/College, and Degree';
      console.log('Validation failed');
      return;
    }

    console.log('=== VALIDATION PASSED ===');
    console.log('Final data to send:', this.newEducation);
    console.log('Proceeding with API call');
    this.loading = true;
    this.error = null;

    this.educationService.update(this.newEducation.educationId, this.newEducation).subscribe({
      next: (response: any) => {
        console.log('=== UPDATE SUCCESS ===');
        console.log('Response:', response);
        this.loading = false;
        // Check if response indicates success (handle different response formats)
        if (response && (response.status === 200 || response.success || response === null)) {
          this.error = null;
          // Close modal and clear form
          this.closeAddModal();
          // Refresh the list
          this.getEducation();
        } else if (response && response.message) {
          this.error = response.message;
        } else {
          this.error = 'Education updated successfully';
          // Still refresh the list since the operation likely succeeded
          this.closeAddModal();
          this.getEducation();
        }
      },
      error: (err: any) => {
        console.log('=== UPDATE ERROR ===');
        console.log('Error details:', err);
        this.loading = false;
        this.error = 'Error updating education: ' + err.message;
      }
    });
  }

  viewEducation(edu: any) {
    // View education functionality - could open a modal or navigate to detail view
    console.log('Viewing education:', edu);
    alert(`Viewing education: ${edu.degree} at ${edu.schoolCollege}`);
  }
}
