import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Experience } from './experience.model';
import { ExperienceService } from './experience.service';
import { AuthService } from '../service/auth.service';
import { FilterPipe } from './filter.pipe';

@Component({
  selector: 'app-experience-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FilterPipe],
  templateUrl: './experience-list.component.html',
  styleUrls: ['./experience-list.component.css']
})
export class ExperienceListComponent implements OnInit {
  experiences: Experience[] = [];
  searchTerm = '';
  isLoading = false;
  currentUserId = 0;
  currentUserRole = '';

  constructor(
    private service: ExperienceService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    const authId = Number((user as any)?.id ?? (user as any)?.userId ?? 0);
    if (authId > 0) {
      this.currentUserId = authId;
      this.currentUserRole = String((user as any)?.role ?? '');
      this.loadExperiences();
      return;
    }

    // Fallback for stale in-memory auth state after page refresh
    try {
      const stored = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      const parsed = stored ? JSON.parse(stored) : null;
      const fallbackId = Number(parsed?.id ?? parsed?.userId ?? 0);
      if (fallbackId > 0) {
        this.currentUserId = fallbackId;
        this.currentUserRole = String(parsed?.role ?? '');
        this.loadExperiences();
        return;
      }
    } catch {}

    alert('Please login first');
    this.router.navigate(['/login']);
  }

  loadExperiences(): void {
    this.isLoading = true;
    // ✅ Fixed: pass only userId (service accepts 1 argument)
    const role = this.currentUserRole.toLowerCase();
    const isHrOrAdmin = role === 'hr' || role === 'admin';
    const request$ = isHrOrAdmin
      ? this.service.getAllExperiences()
      : this.service.getAllExperiences(this.currentUserId);

    request$.subscribe(
      (response) => {
        const rows = this.extractRows(response);
        this.experiences = rows.map((row: any) => this.normalizeExperience(row));
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading experiences:', error);
        this.isLoading = false;
        alert('Failed to load experiences');
      }
    );
  }

  get filteredExperiences(): Experience[] {
    if (!this.searchTerm) return this.experiences;
    const term = this.searchTerm.toLowerCase();
    return this.experiences.filter(exp =>
      (exp.companyName ?? '').toLowerCase().includes(term) ||
      (exp.designation ?? '').toLowerCase().includes(term)
    );
  }

  onEdit(experience: Experience): void {
    const id = this.resolveExperienceId(experience);
    if (!id) { alert('Experience ID not found for edit.'); return; }
    sessionStorage.setItem('editExperience', JSON.stringify(experience));
    this.router.navigate([`/experience/edit/${id}`]);
  }

  onDelete(experience: Experience): void {
    const id = this.resolveExperienceId(experience);
    if (!id) { alert('Experience ID not found for delete.'); return; }

    if (confirm(`Delete ${experience.designation} at ${experience.companyName}?`)) {
      this.service.deleteExperience(id).subscribe(
        () => { alert('Experience deleted successfully!'); this.loadExperiences(); },
        (error) => { console.error('Error deleting:', error); alert('Failed to delete experience'); }
      );
    }
  }

  onAddNew(): void {
    sessionStorage.removeItem('editExperience');
    this.router.navigate(['/experience/add']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/profile']);
  }

  calculateDuration(startDate: string, endDate: string, isCurrent: boolean): string {
    if (!startDate) return 'N/A';
    try {
      const start = new Date(startDate + '-01');
      const end = isCurrent ? new Date() : new Date(endDate + '-01');
      let months = (end.getFullYear() - start.getFullYear()) * 12;
      months += end.getMonth() - start.getMonth();
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (years > 0 && remainingMonths > 0) return `${years}y ${remainingMonths}m`;
      if (years > 0) return `${years}y`;
      return `${remainingMonths}m`;
    } catch { return 'N/A'; }
  }

  getFirstLetters(text: string): string {
    return (text || '').split(' ').map(w => w.charAt(0)).join('').toUpperCase().substring(0, 2);
  }

  trackByExp = (index: number, exp: Experience): number =>
    this.resolveExperienceId(exp) ?? index;

  private resolveExperienceId(exp: any): number | null {
    const rawId =
      exp?.experienceId ?? exp?.ExperienceId ??
      exp?.experienceID ?? exp?.ExperienceID ??
      exp?.experience_Id ?? exp?.Experience_Id ??
      exp?.expId ?? exp?.ExpId ??
      exp?.id ?? exp?.Id;
    const id = Number(rawId);
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  private normalizeExperience(raw: any): Experience {
    return {
      id:          this.resolveExperienceId(raw) ?? undefined,
      userId:      Number(raw?.userId ?? raw?.UserId ?? this.currentUserId),
      companyName: raw?.companyName ?? raw?.CompanyName ?? raw?.company ?? raw?.Company ?? '',
      designation: raw?.designation ?? raw?.Designation ?? raw?.position ?? raw?.Position ?? '',
      startDate:   raw?.startDate ?? raw?.StartDate ?? '',
      endDate:     raw?.endDate   ?? raw?.EndDate   ?? '',
      isCurrent:   Boolean(raw?.isCurrent ?? raw?.IsCurrent ?? false)
    };
  }

  private extractRows(response: any): any[] {
    if (Array.isArray(response)) return response;
    const nested = response?.data ?? response?.result ?? response?.items ?? response?.list ?? response?.records;
    if (Array.isArray(nested))           return nested;
    if (Array.isArray(nested?.data))     return nested.data;
    if (Array.isArray(nested?.items))    return nested.items;
    if (Array.isArray(nested?.$values))  return nested.$values;
    if (Array.isArray(response?.$values)) return response.$values;
    if (nested && typeof nested === 'object') return [nested];
    return [];
  }
}
