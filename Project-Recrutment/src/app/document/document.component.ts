import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../service/document.service';
import { ActivatedRoute, Router } from '@angular/router';

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
    private route: ActivatedRoute
  ) {
    this.documentForm = this.fb.group({
      documentName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.id) {
      this.router.navigate(['/login']);
      return;
    }
    this.userId = user.id;
    
    this.documentId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.documentId) {
      this.isEditMode = true;
      this.loadDocumentById(this.documentId);
    }
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
    if (this.documentForm.invalid || !this.selectedFile) {
      this.errorMessage = 'Please fill all required fields and select a file';
      return;
    }

    this.loading = true;

    const formData = new FormData();
    formData.append('UserId', this.userId.toString());
    formData.append('DocumentName', this.documentForm.value.documentName);
    formData.append('DocumentFile', this.selectedFile);

    const req = this.isEditMode
      ? this.documentService.update(this.documentId!, formData)
      : this.documentService.insert(formData);

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