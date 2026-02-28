import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EducationService } from '../service/education.service';

@Component({
  selector: 'app-education-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './education-list.component.html',
  styleUrls: ['./education-list.component.css']
})
export class EducationListComponent implements OnInit {
  educationList: any[] = [];
  userId!: number;

  constructor(
    private educationService: EducationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = user.id;
    this.loadEducation();
  }

  loadEducation() {
    this.educationService.getByUserId(this.userId).subscribe(res => {
      this.educationList = res || [];
    });
  }

  addNew() {
    this.router.navigate(['/dashboard/education/add']);
  }

  edit(id: number) {
    this.router.navigate(['/dashboard/education/edit', id]);
  }

  delete(id: number) {
    if (!confirm('Delete this education record?')) return;
    this.educationService.delete(id).subscribe(() => this.loadEducation());
  }
}