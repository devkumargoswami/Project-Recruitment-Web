import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkillService } from './skill.service';
import { SkillModel, ApiResponse } from './skill.model';

@Component({
  selector: 'app-skill',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './skill-list.component.html',
  styleUrls: ['./skill-list.component.css']
})
export class SkillComponent {
  skills: SkillModel[] = [];
  loading = false;
  error: string | null = null;
  
  // Form fields for adding new skill
  newSkill: SkillModel = { id: 0, userId: 0, name: '' };
  
  // Form fields for searching
  searchId: number | null = null;
  searchUserId: number | null = null;
  
  // Modal state
  isAddModalOpen = false;
  
  // Success message state
  successMessage: string | null = null;
  
  constructor(private skillService: SkillService) {}

  openAddModal() {
    this.isAddModalOpen = true;
    this.newSkill = { id: 0, userId: 0, name: '' };
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    this.newSkill = { id: 0, userId: 0, name: '' };
  }

  addSkill() {
    console.log('=== ADD SKILL BUTTON CLICKED ===');
    console.log('Form data:', this.newSkill);
    console.log('User ID type:', typeof this.newSkill.userId);
    console.log('User ID value:', this.newSkill.userId);
    console.log('Name type:', typeof this.newSkill.name);
    console.log('Name value:', this.newSkill.name);
    
    // Convert userId to number if it's a string (common issue)
    if (typeof this.newSkill.userId === 'string') {
      this.newSkill.userId = parseInt(this.newSkill.userId, 10);
      console.log('Converted userId to number:', this.newSkill.userId);
    }
    
    // Trim whitespace from name
    this.newSkill.name = this.newSkill.name.trim();
    console.log('Trimmed name:', this.newSkill.name);
    
    if (!this.newSkill.userId || !this.newSkill.name) {
      this.error = 'Please fill in User ID and Skill Name';
      console.log('Validation failed');
      return;
    }

    console.log('=== VALIDATION PASSED ===');
    console.log('Final data to send:', this.newSkill);
    console.log('Final data JSON:', JSON.stringify(this.newSkill));
    console.log('Proceeding with API call');
    this.loading = true;
    this.error = null;

    this.skillService.insertSkill(this.newSkill).subscribe({
      next: (response: ApiResponse) => {
        console.log('=== API CALL SUCCESSFUL ===');
        console.log('Response:', response);
        this.loading = false;
        if (response.status === 200) {
          this.error = null;
          this.successMessage = 'Skill successfully added!';
          // Close modal and clear form
          this.closeAddModal();
          // Clear the form data
          this.newSkill = { id: 0, userId: 0, name: '' };
          // Refresh the list to show the new skill
          console.log('Refreshing skills list after successful addition');
          this.getSkills();
          
          // Auto-hide success message after 3 seconds
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        } else {
          this.error = response.message || 'Failed to add skill';
        }
      },
      error: (err) => {
        console.log('=== API CALL FAILED ===');
        console.log('Error details:', err);
        this.loading = false;
        
        // Check if this is a parsing error but the operation might have succeeded
        if (err.status === 200 || err.message?.includes('parsing error')) {
          console.log('=== PARSING ERROR BUT OPERATION LIKELY SUCCEEDED ===');
          this.error = null;
          this.successMessage = 'Skill successfully added!';
          // Close modal and clear form
          this.closeAddModal();
          // Clear the form data
          this.newSkill = { id: 0, userId: 0, name: '' };
          // Refresh the list to show the new skill
          console.log('Refreshing skills list after successful addition (despite parsing error)');
          this.getSkills();
          
          // Auto-hide success message after 3 seconds
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        } else {
          this.error = 'Error adding skill: ' + err.message;
        }
      }
    });
  }

  searchSkill() {
    this.loading = true;
    this.error = null;

    this.skillService.searchSkill(
      this.searchId || undefined, 
      this.searchUserId || undefined
    ).subscribe({
      next: (data: SkillModel[]) => {
        this.loading = false;
        this.skills = data;
        if (data.length === 0) {
          this.error = 'No skills found';
        } else {
          this.error = null;
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error searching skills: ' + err.message;
      }
    });
  }

  getSkills() {
    this.loading = true;
    this.error = null;

    this.skillService.getSkills().subscribe({
      next: (data: SkillModel[]) => {
        this.loading = false;
        this.skills = data;
        this.error = null;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error loading skills: ' + err.message;
      }
    });
  }

  deleteSkill(id: number) {
    if (confirm('Are you sure you want to delete this skill?')) {
      this.loading = true;
      this.error = null;

      this.skillService.deleteSkill(id).subscribe({
        next: (response: ApiResponse) => {
          this.loading = false;
          if (response.status === 200) {
            this.error = null;
            this.successMessage = 'Skill successfully deleted!';
            // Refresh the list
            this.getSkills();
            
            // Auto-hide success message after 3 seconds
            setTimeout(() => {
              this.successMessage = null;
            }, 3000);
          } else {
            this.error = response.message || 'Failed to delete skill';
          }
        },
        error: (err) => {
          this.loading = false;
          
          // Check if this is a parsing error but the operation might have succeeded
          if (err.status === 200 || err.message?.includes('parsing error')) {
            console.log('=== DELETE PARSING ERROR BUT OPERATION LIKELY SUCCEEDED ===');
            this.error = null;
            this.successMessage = 'Skill successfully deleted!';
            // Refresh the list
            this.getSkills();
            
            // Auto-hide success message after 3 seconds
            setTimeout(() => {
              this.successMessage = null;
            }, 3000);
          } else {
            this.error = 'Error deleting skill: ' + err.message;
          }
        }
      });
    }
  }

  editSkill(id: number) {
    console.log('=== EDIT SKILL BUTTON CLICKED ===');
    console.log('Skill ID to edit:', id);
    
    this.loading = true;
    this.error = null;

    // Find the skill to edit
    const skillToEdit = this.skills.find(skill => skill.id === id);
    
    if (!skillToEdit) {
      this.loading = false;
      this.error = 'Skill not found';
      console.log('Skill not found in local array');
      return;
    }

    console.log('Skill to edit:', skillToEdit);
    
    // Set the skill data to the form
    this.newSkill = { ...skillToEdit };
    
    // Open the modal
    this.isAddModalOpen = true;
    this.loading = false;
    
    console.log('Modal opened with skill data:', this.newSkill);
  }

  updateSkill() {
    console.log('=== UPDATE SKILL BUTTON CLICKED ===');
    console.log('Form data:', this.newSkill);
    console.log('User ID type:', typeof this.newSkill.userId);
    console.log('User ID value:', this.newSkill.userId);
    console.log('Name type:', typeof this.newSkill.name);
    console.log('Name value:', this.newSkill.name);
    console.log('Skill ID:', this.newSkill.id);
    
    // Convert userId to number if it's a string (common issue)
    if (typeof this.newSkill.userId === 'string') {
      this.newSkill.userId = parseInt(this.newSkill.userId, 10);
      console.log('Converted userId to number:', this.newSkill.userId);
    }
    
    // Trim whitespace from name
    this.newSkill.name = this.newSkill.name.trim();
    console.log('Trimmed name:', this.newSkill.name);
    
    if (!this.newSkill.id || !this.newSkill.userId || !this.newSkill.name) {
      this.error = 'Please fill in all fields';
      console.log('Validation failed');
      return;
    }

    console.log('=== VALIDATION PASSED ===');
    console.log('Final data to send:', this.newSkill);
    console.log('Final data JSON:', JSON.stringify(this.newSkill));
    console.log('Proceeding with API call');
    this.loading = true;
    this.error = null;

    this.skillService.updateSkill(this.newSkill).subscribe({
      next: (response: ApiResponse) => {
        console.log('=== API CALL SUCCESSFUL ===');
        console.log('Response:', response);
        this.loading = false;
        if (response.status === 200) {
          this.error = null;
          // Close modal and clear form
          this.closeAddModal();
          // Clear the form data
          this.newSkill = { id: 0, userId: 0, name: '' };
          // Refresh the list
          console.log('Refreshing skills list after successful update');
          this.getSkills();
        } else {
          this.error = response.message || 'Failed to update skill';
        }
      },
      error: (err) => {
        console.log('=== API CALL FAILED ===');
        console.log('Error details:', err);
        this.loading = false;
        this.error = 'Error updating skill: ' + err.message;
      }
    });
  }
}
