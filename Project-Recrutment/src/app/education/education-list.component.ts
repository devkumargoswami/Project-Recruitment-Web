import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EducationService } from '../service/education.service';
import { EducationModel } from './education.model';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-education-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './education-list.component.html',
  styleUrls: ['./education-list.component.css']
})
export class EducationListComponent implements OnInit {

  educationList: EducationModel[] = [];
  loading = false;
  error: string | null = null;

  // Form fields for searching
  searchId: number | null = null;
  searchUserId: number | null = null;

  isAddModalOpen = false;

  newEducation: EducationModel = {
    id: 0,
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

  currentUserId: number | null = null;
  currentUserRole: string | null = null;

  constructor(
    private educationService: EducationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEducation();
  }

  /** OPEN MODAL */
  openAddModal() {
    this.isAddModalOpen = true;
    this.resetForm();
  }

  /** CLOSE MODAL */
  closeAddModal() {
    this.isAddModalOpen = false;
    this.resetForm();
  }

  /** RESET FORM */
  resetForm() {
    this.newEducation = {
      id: 0,
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

  /** LOAD EDUCATION */
  loadEducation() {
    this.loading = true;
    this.error = null;

    // Get current user information
    const currentUser = this.authService.getUser();
    if (!currentUser) {
      this.loading = false;
      this.error = 'User not authenticated';
      return;
    }

    this.currentUserId = currentUser.id;
    this.currentUserRole = currentUser.role;
    console.log('Current user ID:', this.currentUserId, 'Role:', this.currentUserRole);

    this.educationService.getByUserId(this.currentUserId).subscribe({
      next: (data: EducationModel[]) => {
        this.loading = false;
        this.educationList = data;
        this.error = null;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error loading education: ' + err.message;
      }
    });
  }

  /** SEARCH EDUCATION */
  searchEducation() {
    this.loading = true;
    this.error = null;

    if (this.searchId) {
      this.educationService.getById(this.searchId).subscribe({
        next: (data: EducationModel) => {
          this.loading = false;
          this.educationList = data ? [data] : [];
          if (this.educationList.length === 0) {
            this.error = 'No education record found with this ID';
          }
        },
        error: (err: any) => {
          this.loading = false;
          this.error = 'Error searching education: ' + err.message;
        }
      });
    } else if (this.searchUserId) {
      this.educationService.getByUserId(this.searchUserId).subscribe({
        next: (data: EducationModel[]) => {
          this.loading = false;
          this.educationList = data;
          if (data.length === 0) {
            this.error = 'No education records found for this user';
          }
        },
        error: (err: any) => {
          this.loading = false;
          this.error = 'Error searching education: ' + err.message;
        }
      });
    } else {
      this.loadEducation();
    }
  }

  /** ADD EDUCATION */
  addEducation() {
    console.log('=== ADD EDUCATION BUTTON CLICKED ===');
    console.log('Form data:', this.newEducation);
    console.log('User ID type:', typeof this.newEducation.userId);
    console.log('User ID value:', this.newEducation.userId);
    console.log('School/College type:', typeof this.newEducation.schoolCollege);
    console.log('School/College value:', this.newEducation.schoolCollege);
    console.log('Degree type:', typeof this.newEducation.degree);
    console.log('Degree value:', this.newEducation.degree);
    
    // Convert userId to number if it's a string (common issue)
    if (typeof this.newEducation.userId === 'string') {
      this.newEducation.userId = parseInt(this.newEducation.userId, 10);
      console.log('Converted userId to number:', this.newEducation.userId);
    }
    
    // Trim whitespace from fields
    this.newEducation.schoolCollege = this.newEducation.schoolCollege?.trim() || '';
    this.newEducation.degree = this.newEducation.degree?.trim() || '';
    this.newEducation.boardUniversity = this.newEducation.boardUniversity?.trim() || '';
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
          this.loadEducation();
        } else if (response && response.message) {
          this.error = response.message;
        } else {
          this.error = 'Education added successfully, but response format is unexpected';
          // Still refresh the list since the operation likely succeeded
          this.closeAddModal();
          this.loadEducation();
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

  /** EDIT EDUCATION */
  editEducation(edu: EducationModel) {
    // Open the add modal with the education data pre-filled
    this.isAddModalOpen = true;
    this.newEducation = {
      id: edu.id,
      userId: edu.userId,
      educationLevelId: edu.educationLevelId,
      schoolCollege: edu.schoolCollege,
      boardUniversity: edu.boardUniversity || '',
      degree: edu.degree,
      startMonth: edu.startMonth,
      startYear: edu.startYear,
      endMonth: edu.endMonth || 1,
      endYear: edu.endYear || 2021,
      isContinue: edu.isContinue
    };
  }

  /** UPDATE EDUCATION */
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
    this.newEducation.boardUniversity = this.newEducation.boardUniversity?.trim() || '';
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

    this.educationService.update(this.newEducation).subscribe({
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
          this.loadEducation();
        } else if (response && response.message) {
          this.error = response.message;
        } else {
          this.error = 'Education updated successfully';
          // Still refresh the list since the operation likely succeeded
          this.closeAddModal();
          this.loadEducation();
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

  /** DELETE EDUCATION */
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
            this.loadEducation();
          } else if (response && response.message) {
            this.error = response.message;
          } else {
            this.error = 'Education deleted successfully';
            // Still refresh the list since the operation likely succeeded
            this.loadEducation();
          }
        },
        error: (err: any) => {
          this.loading = false;
          this.error = 'Error deleting education: ' + err.message;
        }
      });
    }
  }

  /** VIEW EDUCATION */
  viewEducation(edu: EducationModel) {
    // View education functionality - could open a modal or navigate to detail view
    console.log('Viewing education:', edu);
    alert(
      `Viewing education:\n` +
      `Degree: ${edu.degree}\n` +
      `School/College: ${edu.schoolCollege}\n` +
      `Board/University: ${edu.boardUniversity || 'N/A'}\n` +
      `Start: ${edu.startMonth}/${edu.startYear}\n` +
      `End: ${edu.isContinue ? 'Present' : edu.endMonth + '/' + edu.endYear}`
    );
  }
}
