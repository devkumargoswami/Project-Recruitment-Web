import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../service/document.service';

@Component({
  selector: 'app-document',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent {

  documentForm: FormGroup;
  selectedFile!: File;

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService
  ) {
    this.documentForm = this.fb.group({
      userId: ['', Validators.required],
      documentName: ['', Validators.required]
    });
  }

  onFileSelect(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    if (this.documentForm.invalid || !this.selectedFile) return;

    const formData = new FormData();
    formData.append('UserId', this.documentForm.value.userId);
    formData.append('DocumentName', this.documentForm.value.documentName);
    formData.append('DocumentFile', this.selectedFile);

    this.documentService.insert(formData).subscribe({
      next: () => alert('Document uploaded successfully'),
      error: () => alert('Document upload failed')
    });
  }
}