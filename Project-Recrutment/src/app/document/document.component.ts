import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../service/document.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService, UserProfile } from '../service/profile.service';

@Component({
  selector: 'app-document',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements OnInit {
  documentForm!: FormGroup;
  selectedFile: File | null = null;
  userId!: number;
  documentId: number | null = null;
  isEditMode = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private router: Router,
    private route: ActivatedRoute,
    private profileService: ProfileService
  ) {
    this.documentForm = this.fb.group({
      documentName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Auto-fill user ID from profile API
    this.loadUserIdFromProfile();
    
    this.documentId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.documentId) {
      this.isEditMode = true;
      this.loadDocumentById(this.documentId);
    }
  }

  private loadUserIdFromProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (user: UserProfile) => {
        this.userId = user.id;
      },
      error: (error) => {
        console.error('Failed to load user profile:', error);
        // Fallback to session storage if API fails
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user?.id) {
            this.userId = user.id;
          }
        } catch (sessionError) {
          console.warn('Failed to load user from session:', sessionError);
        }
      }
    });
  }

  loadDocumentById(id: number): void {
    this.documentService.getById(id).subscribe({
      next: (res: any) => {
        this.documentForm.patchValue({ documentName: res.documentName });
        this.selectedFile = null;
      },
      error: () => this.errorMessage = 'Failed to load document'
    });
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'File size must be less than 5MB';
      event.target.value = '';
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Only PDF, JPG, and PNG files are allowed';
      event.target.value = '';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';
  }

  onSubmit(): void {
    // Check if document type is selected
    const formValue = this.documentForm.value;
    if (!formValue.documentName || formValue.documentName.toString().trim() === '') {
      this.errorMessage = 'All fields are required';
      return;
    }

    // For new documents, check if file is selected
    if (!this.isEditMode && !this.selectedFile) {
      this.errorMessage = 'All fields are required';
      return;
    }

    // Validate userId is not null or zero
    if (!this.userId || this.userId <= 0) {
      this.errorMessage = 'User ID is required';
      return;
    }

    this.loading = true;

    // Convert to the exact format your API expects
    const payload = {
      userId: this.userId,
      documentName: this.documentForm.value.documentName,
      documentPath: this.selectedFile ? this.selectedFile.name : '',
      createDatetime: new Date().toISOString()
    };

    const req = this.isEditMode
      ? this.documentService.update(payload)
      : this.documentService.insert(payload);

    req.subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = this.isEditMode
          ? 'Document updated successfully'
          : 'Document uploaded successfully';
        setTimeout(() => this.router.navigate(['/dashboard/documents']), 1200);
      },
      error: () => { 
        this.loading = false;
        this.errorMessage = 'Operation failed. Try again.';
      }
    });
  }
}
