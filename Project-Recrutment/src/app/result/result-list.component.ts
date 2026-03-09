import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ResultService } from '../service/result.service';
import { Result } from '../result/result.model';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-result-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.css']
})
export class ResultListComponent implements OnInit {
  results: Result[] = [];
  loading = false;
  error: string | null = null;
  currentUserId: number | null = null;

  constructor(
    private resultService: ResultService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadResults();
  }

  loadResults(): void {
    this.loading = true;
    this.error = null;

    // Get current user ID from auth service
    const currentUser = this.authService.getUser();
    if (!currentUser) {
      this.loading = false;
      this.error = 'User not authenticated';
      return;
    }

    this.currentUserId = currentUser.id;
    console.log('Current user ID:', this.currentUserId, 'Role:', currentUser.role);

    // Check if user is HR or Admin - they can see all results
    if (currentUser.role === 'HR' || currentUser.role === 'Admin') {
      console.log('HR/Admin user - loading all results');
      // For HR/Admin, we need to get all results
      // This would require a different API endpoint or parameter
      // For now, we'll use 0 to indicate "all results" or modify the service
      this.resultService.getResultByCandidate(0).subscribe({
        next: (data: Result[]) => {
          this.loading = false;
          this.results = data;
          console.log('All results loaded successfully:', data);
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error loading results: ' + err.message;
          console.error('Error loading results:', err);
        }
      });
    } else {
      // Regular users (Candidates, Employers) see only their own results
      console.log('Regular user - loading personal results for user', this.currentUserId);
      this.resultService.getResultByCandidate(this.currentUserId).subscribe({
        next: (data: Result[]) => {
          this.loading = false;
          this.results = data;
          console.log('Personal results loaded successfully for user', this.currentUserId, ':', data);
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error loading results: ' + err.message;
          console.error('Error loading results:', err);
        }
      });
    }
  }

  addResult(): void {
    this.router.navigate(['/results/add']);
  }

  editResult(id: number): void {
    this.router.navigate(['/results/edit', id]);
  }

  deleteResult(id: number): void {
    if (!confirm('Delete this result?')) return;
    
    this.resultService.deleteResult(id).subscribe({
      next: () => {
        this.results = this.results.filter(r => r.result_id !== id);
      },
      error: (err) => {
        console.error('Error deleting result:', err);
      }
    });
  }

  getTotalMarks(result: Result): number {
    return result.technical_marks + result.hr_marks;
  }
}