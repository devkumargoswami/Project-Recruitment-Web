import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../service/document.service';
import { DocumentModel } from './document.model';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})
export class DocumentListComponent implements OnInit {

  documents: DocumentModel[] = [];
  loading = false;
  error: string | null = null;

  // Form fields for searching
  searchId: number | null = null;
  searchUserId: number | null = null;

  isAddModalOpen = false;

  newDocument: DocumentModel = {
    documentId: 0,
    userId: 0,
    documentName: '',
    documentPath: '',
    createDatetime: ''
  };

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    this.getDocuments();
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
    this.newDocument = {
      documentId: 0,
      userId: 0,
      documentName: '',
      documentPath: '',
      createDatetime: ''
    };
  }

  /** LOAD DOCUMENTS */
  getDocuments() {
    this.loading = true;
    this.error = null;

    this.documentService.getCurrentUserId().subscribe({
      next: (userId: number) => {
        this.documentService.getByUserId(userId).subscribe({
          next: (data: DocumentModel[]) => {
            this.documents = data;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error loading documents: ' + err.message;
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error getting user ID: ' + err.message;
      }
    });
  }

  /** SEARCH DOCUMENT */
  searchDocument() {
    this.loading = true;
    this.error = null;

    if (this.searchId) {
      this.documentService.getById(this.searchId).subscribe({
        next: (data: DocumentModel) => {
          this.loading = false;
          this.documents = data ? [data] : [];
          if (this.documents.length === 0) {
            this.error = 'No document found with this ID';
          }
        },
        error: (err: any) => {
          this.loading = false;
          this.error = 'Error searching document: ' + err.message;
        }
      });
    } else if (this.searchUserId) {
      this.documentService.getByUserId(this.searchUserId).subscribe({
        next: (data: DocumentModel[]) => {
          this.loading = false;
          this.documents = data;
          if (data.length === 0) {
            this.error = 'No documents found for this user';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error searching documents: ' + err.message;
        }
      });
    } else {
      this.getDocuments();
    }
  }

  /** ADD DOCUMENT */
  addDocument() {
    console.log('=== ADD DOCUMENT BUTTON CLICKED ===');
    console.log('Form data:', this.newDocument);
    console.log('User ID type:', typeof this.newDocument.userId);
    console.log('User ID value:', this.newDocument.userId);
    console.log('Document Name type:', typeof this.newDocument.documentName);
    console.log('Document Name value:', this.newDocument.documentName);
    console.log('Document Path:', this.newDocument.documentPath);
    
    // Convert userId to number if it's a string (common issue)
    if (typeof this.newDocument.userId === 'string') {
      this.newDocument.userId = parseInt(this.newDocument.userId, 10);
      console.log('Converted userId to number:', this.newDocument.userId);
    }
    
    // Trim whitespace from fields
    this.newDocument.documentName = this.newDocument.documentName?.trim() || '';
    this.newDocument.documentPath = this.newDocument.documentPath?.trim() || '';
    console.log('Trimmed fields:', this.newDocument);
    
    if (!this.newDocument.userId || !this.newDocument.documentName) {
      this.error = 'Please fill in User ID and Document Name';
      console.log('Validation failed');
      return;
    }

    console.log('=== VALIDATION PASSED ===');
    console.log('Final data to send:', this.newDocument);
    console.log('Proceeding with API call');
    this.loading = true;
    this.error = null;

    // Use JSON format as expected by the API
    const payload: DocumentModel = {
      documentId: 0,
      userId: this.newDocument.userId,
      documentName: this.newDocument.documentName,
      documentPath: this.newDocument.documentPath,
      createDatetime: new Date().toISOString()
    };

    this.documentService.insert(payload).subscribe({
      next: (response: any) => {
        console.log('=== API CALL SUCCESSFUL ===');
        console.log('Response:', response);
        this.loading = false;
        // Check if response indicates success (handle different response formats)
        if (response && (response.status === 200 || response.success || response.id || response === null)) {
          this.error = null;
          // Close modal and clear form
          this.closeAddModal();
          // Refresh the list
          this.getDocuments();
        } else if (response && response.message) {
          this.error = response.message;
        } else {
          this.error = 'Document added successfully, but response format is unexpected';
          // Still refresh the list since the operation likely succeeded
          this.closeAddModal();
          this.getDocuments();
        }
      },
      error: (err: any) => {
        console.log('=== API CALL FAILED ===');
        console.log('Error details:', err);
        this.loading = false;
        this.error = 'Error adding document: ' + err.message;
      }
    });
  }

  /** EDIT DOCUMENT */
  editDocument(doc: DocumentModel) {
    // Open the add modal with the document data pre-filled
    this.isAddModalOpen = true;
    this.newDocument = {
      documentId: doc.documentId,
      userId: doc.userId,
      documentName: doc.documentName,
      documentPath: doc.documentPath,
      createDatetime: doc.createDatetime
    };
  }

  /** UPDATE DOCUMENT */
  updateDocument() {
    console.log('=== UPDATE DOCUMENT BUTTON CLICKED ===');
    console.log('Form data:', this.newDocument);
    
    // Convert userId to number if it's a string (common issue)
    if (typeof this.newDocument.userId === 'string') {
      this.newDocument.userId = parseInt(this.newDocument.userId, 10);
      console.log('Converted userId to number:', this.newDocument.userId);
    }
    
    // Trim whitespace from fields
    this.newDocument.documentName = this.newDocument.documentName?.trim() || '';
    this.newDocument.documentPath = this.newDocument.documentPath?.trim() || '';
    console.log('Trimmed fields:', this.newDocument);
    
    if (!this.newDocument.userId || !this.newDocument.documentName) {
      this.error = 'Please fill in User ID and Document Name';
      console.log('Validation failed');
      return;
    }

    console.log('=== VALIDATION PASSED ===');
    console.log('Final data to send:', this.newDocument);
    console.log('Proceeding with API call');
    this.loading = true;
    this.error = null;

    // Use JSON format as expected by the API
    const payload: DocumentModel = {
      documentId: this.newDocument.documentId,
      userId: this.newDocument.userId,
      documentName: this.newDocument.documentName,
      documentPath: this.newDocument.documentPath,
      createDatetime: new Date().toISOString()
    };

    this.documentService.update(payload).subscribe({
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
          this.getDocuments();
        } else if (response && response.message) {
          this.error = response.message;
        } else {
          this.error = 'Document updated successfully';
          // Still refresh the list since the operation likely succeeded
          this.closeAddModal();
          this.getDocuments();
        }
      },
      error: (err: any) => {
        console.log('=== UPDATE ERROR ===');
        console.log('Error details:', err);
        this.loading = false;
        this.error = 'Error updating document: ' + err.message;
      }
    });
  }

  /** DELETE DOCUMENT */
  deleteDocument(id: number) {
    if (confirm('Are you sure you want to delete this document?')) {
      this.loading = true;
      this.error = null;

      this.documentService.delete(id).subscribe({
        next: (response: any) => {
          this.loading = false;
          // Check if response indicates success (handle different response formats)
          if (response && (response.status === 200 || response.success || response === null)) {
            this.error = null;
            // Refresh the list
            this.getDocuments();
          } else if (response && response.message) {
            this.error = response.message;
          } else {
            this.error = 'Document deleted successfully';
            // Still refresh the list since the operation likely succeeded
            this.getDocuments();
          }
        },
        error: (err: any) => {
          this.loading = false;
          this.error = 'Error deleting document: ' + err.message;
        }
      });
    }
  }

  /** VIEW DOCUMENT */
  viewDocument(doc: DocumentModel) {
    // View document functionality - could open a modal or navigate to detail view
    console.log('Viewing document:', doc);
    alert(`Viewing document: ${doc.documentName}\nPath: ${doc.documentPath}\nCreated: ${doc.createDatetime}`);
  }
}
