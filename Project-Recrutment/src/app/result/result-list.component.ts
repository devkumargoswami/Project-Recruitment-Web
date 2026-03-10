import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResultService } from '../service/result.service';
import { AuthService } from '../service/auth.service';
import { Result } from './result.model';

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
  error = '';
  candidateId: number | null = null;
  isHR = false;

  constructor(
    private resultService: ResultService,
    private authService: AuthService,
    private router: Router
  ) {}

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

    this.loading = true;
    this.error = '';

    this.resultService.getResultByCandidate(this.candidateId).subscribe({
      next: (data) => {
        this.results = data ?? [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load results.';
        this.loading = false;
      }
    });
  }

  goToAdd(): void {
    this.router.navigate(['/results/add']);
  }
}
