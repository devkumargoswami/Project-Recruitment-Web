import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DocumentService } from '../service/document.service';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})
export class DocumentListComponent implements OnInit {
  documents: any[] = [];
  userId!: number;
  loading = true;

  constructor(
    private documentService: DocumentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = user.id;
    this.loadDocuments();
  }

  loadDocuments() {
    this.documentService.getByUserId(this.userId).subscribe(res => {
      this.documents = res || [];
      this.loading = false;
    });
  }

  addNew() {
    this.router.navigate(['/dashboard/documents/add']);
  }

  edit(id: number) {
    this.router.navigate(['/dashboard/documents/edit', id]);
  }

  delete(id: number) {
    if (!confirm('Delete this document?')) return;
    this.documentService.delete(id).subscribe(() => this.loadDocuments());
  }
}