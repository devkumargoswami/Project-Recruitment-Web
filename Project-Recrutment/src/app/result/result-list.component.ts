import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResultService } from '../service/result.service';
import { Result } from '../result/result.model';
import { AuthService, AuthUser } from '../auth.service';

@Component({
  selector: 'app-result-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.css']
})
export class ResultListComponent implements OnInit {
  results: Result[] = [];
  loading = false;
  error: string | null = null;
  currentUserId: number | null = null;
  currentUser: AuthUser | null = null;

  constructor(
    private resultService: ResultService,
    private authService: AuthService,
    private router: Router
  ) {}

  goBack(): void {
    this.router.navigate(['/dashboard/profile']);
  }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.isHR = user.role === 'HR' || user.role === 'Admin';

    if (!this.isHR) {
      this.candidateId = user.id;
      this.loadResults();
    }
  }

  loadResults(): void {
    if (!this.candidateId || this.candidateId <= 0) {
      this.error = 'Please enter a valid candidate ID.';
      return;
    }

    this.currentUserId = currentUser.id;
    this.currentUser = currentUser;
    console.log('Current user ID:', this.currentUserId, 'Role:', currentUser.role);

    // Check if user is HR or Admin - they can see all results
    if (currentUser.role === 'HR' || currentUser.role === 'Admin') {
      console.log('HR/Admin user - loading all results');
      // Use dedicated GetAllResult API for HR/Admin
      this.resultService.getAllResults().subscribe({
        next: (data: Result[]) => {
          this.loading = false;
          this.results = data;
          console.log('All results loaded successfully:', data);
        },
        error: (err: any) => {
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
        error: (err: any) => {
          this.loading = false;
          this.error = 'Error loading results: ' + err.message;
          console.error('Error loading results:', err);
        }
      });
    }
  }

  addResult(): void {
    // Only allow HR/Admin to add results
    const currentUser = this.authService.getUser();
    if (currentUser?.role !== 'HR' && currentUser?.role !== 'Admin') {
      this.error = 'Access denied: Only HR/Admin can add results';
      return;
    }
    this.router.navigate(['/results/add']);
  }

  editResult(id: number): void {
    // Only allow HR/Admin to edit results
    const currentUser = this.authService.getUser();
    if (currentUser?.role !== 'HR' && currentUser?.role !== 'Admin') {
      this.error = 'Access denied: Only HR/Admin can edit results';
      return;
    }
    this.router.navigate(['/results/edit', id]);
  }

  deleteResult(id: number): void {
    // Only allow HR/Admin to delete results
    const currentUser = this.authService.getUser();
    if (currentUser?.role !== 'HR' && currentUser?.role !== 'Admin') {
      this.error = 'Access denied: Only HR/Admin can delete results';
      return;
    }
    
    if (!confirm('Are you sure you want to delete this result? This action cannot be undone.')) return;
    
    this.loading = true;
    this.error = null;
    
    this.resultService.deleteResult(id).subscribe({
      next: (response: any) => {
        this.loading = false;
        // Remove the deleted result from the list
        this.results = this.results.filter(r => r.result_id !== id);
        console.log('Result deleted successfully:', id);
      },
      error: (err: any) => {
        this.loading = false;
        
        // Handle parsing errors - if the API returns 200 but with empty/unparseable response
        if (err.status === 200 || err.statusText === 'OK') {
          console.log('Result likely deleted successfully despite parsing error:', id);
          // Try to remove the result from the list anyway since the API likely succeeded
          this.results = this.results.filter(r => r.result_id !== id);
          return;
        }
        
        this.error = 'Error deleting result: ' + (err.message || 'Unknown error');
        console.error('Error deleting result:', err);
      }
    });
  }

  goToAdd(): void {
    this.router.navigate(['/results/add']);
  }
}
