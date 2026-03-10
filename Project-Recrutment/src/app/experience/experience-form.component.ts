import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Experience } from './experience.model';
import { ExperienceService } from './experience.service';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-experience-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './experience-form.component.html',
  styleUrls: ['./experience-form.component.css']
})
export class ExperienceFormComponent implements OnInit {
  form!: FormGroup;
  isLoading: boolean = false;
  editingId: number | null = null;
  isEditMode: boolean = false;
  currentUserId: number = 0;
  editUserId: number | null = null;
  canEditUserId = false;

  constructor(
    private fb: FormBuilder,
    private service: ExperienceService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    const user = this.getActiveUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUserId = Number((user as any).id ?? (user as any).userId ?? 0);
    const role = String((user as any).role ?? '').trim().toLowerCase();
    const roleId = Number((user as any).roleId ?? (user as any).RoleId ?? 0);
    this.canEditUserId = role === 'admin' || role === 'hr' || roleId === 1 || roleId === 2;
    if (!this.currentUserId) {
      alert('User ID not found. Please login again.');
      this.router.navigate(['/login']);
      return;
    }
    this.form.patchValue({ userId: this.currentUserId });
    this.checkEditMode();
  }

  checkEditMode(): void {
    const routeId = Number(this.route.snapshot.paramMap.get('id'));
    if (routeId > 0) {
      this.editingId = routeId;
      this.isEditMode = true;
      this.service.getExperienceById(routeId).subscribe({
        next: (experience) => {
          const row = this.extractExperienceRow(experience);
          if (row) {
            this.patchFromExperienceRow(row);
            return;
          }
          if (!this.loadEditDataFromSession(routeId)) {
            alert('Failed to map experience data for edit');
          }
        },
        error: () => {
          if (!this.loadEditDataFromSession(routeId)) {
            alert('Failed to load experience for edit');
          }
        }
      });
      return;
    }

    if (this.route.snapshot.routeConfig?.path === 'add') {
      return;
    }

    const editData = sessionStorage.getItem('editExperience');
    if (editData) {
      try {
        const experience = JSON.parse(editData);
        this.editingId = Number(
          experience?.id ?? experience?.experienceId ?? experience?.ExperienceId ?? 0
        );
        this.isEditMode = true;
        this.patchFromExperienceRow(experience);
        sessionStorage.removeItem('editExperience');
      } catch (error) {
        console.error('Error parsing edit data:', error);
      }
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      userId: [this.currentUserId, [Validators.required]],
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      designation: ['', [Validators.required, Validators.minLength(2)]],
      startDate: ['', Validators.required],
      endDate: [''],
      isCurrent: [false]
    });
  }

  get showEndDate(): boolean {
    return !this.form.get('isCurrent')?.value;
  }

  getError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (control?.hasError('required')) return `${fieldName} is required`;
    if (control?.hasError('minlength')) return `${fieldName} must be at least 2 characters`;
    return '';
  }

  onSubmit(): void {
    if (!this.form.valid) {
      alert('Please fill all required fields');
      return;
    }

    if (this.showEndDate && !this.form.get('endDate')?.value) {
      alert('Please provide end date for completed experiences');
      return;
    }

    this.isLoading = true;
    const formValue = this.form.value;
    const resolvedUserId = this.canEditUserId
      ? Number(formValue.userId ?? this.editUserId ?? this.currentUserId)
      : (this.isEditMode
          ? Number(formValue.userId ?? this.editUserId ?? this.currentUserId)
          : this.currentUserId);

    const payload: Experience = {
      ...formValue,
      userId: resolvedUserId,
      id: this.isEditMode ? (this.editingId ?? undefined) : undefined,
    };

    if (this.isEditMode && this.editingId) {
      this.service.updateExperience(this.editingId, payload).subscribe(
        (result) => {
          this.isLoading = false;
          alert('Experience updated successfully!');
          this.resetForm();
          this.router.navigate(['/experience/list']);
        },
        (error) => {
          this.isLoading = false;
          console.error('Error:', error);
          alert('Failed to update experience');
        }
      );
    } else if (!this.isEditMode) {
      this.service.createExperience(payload).subscribe(
        (result) => {
          this.isLoading = false;
          alert('Experience added successfully!');
          this.resetForm();
          this.router.navigate(['/experience/list']);
        },
        (error) => {
          this.isLoading = false;
          console.error('Error:', error);
          alert('Failed to create experience');
        }
      );
    } else {
      this.isLoading = false;
      alert('Invalid edit state. Please reopen edit page.');
    }
  }

  resetForm(): void {
    this.form.reset();
    this.form.patchValue({ userId: this.currentUserId, isCurrent: false });
    this.editingId = null;
    this.isEditMode = false;
    this.editUserId = null;
  }

  onCancel(): void {
    this.resetForm();
    this.router.navigate(['/experience/list']);
  }

  goToList(): void {
    this.router.navigate(['/experience/list']);
  }

  private extractExperienceRow(response: any): any | null {
    if (!response) return null;
    if (response?.data && !Array.isArray(response.data) && typeof response.data === 'object') return response.data;
    if (response?.result && !Array.isArray(response.result) && typeof response.result === 'object') return response.result;
    if (response?.item && typeof response.item === 'object') return response.item;
    if (Array.isArray(response)) return response[0] ?? null;
    if (Array.isArray(response?.data)) return response.data[0] ?? null;
    if (Array.isArray(response?.result)) return response.result[0] ?? null;
    if (Array.isArray(response?.items)) return response.items[0] ?? null;
    if (Array.isArray(response?.$values)) return response.$values[0] ?? null;
    return response;
  }

  private loadEditDataFromSession(routeId: number): boolean {
    try {
      const raw = sessionStorage.getItem('editExperience');
      if (!raw) return false;

      const experience = JSON.parse(raw);
      const expId = Number(
        experience?.experienceId ??
        experience?.ExperienceId ??
        experience?.experienceID ??
        experience?.ExperienceID ??
        experience?.id ??
        0
      );

      if (expId > 0 && routeId > 0 && expId !== routeId) {
        return false;
      }

      this.editingId = routeId > 0 ? routeId : expId;
      this.isEditMode = this.editingId > 0;
      this.patchFromExperienceRow(experience);
      sessionStorage.removeItem('editExperience');
      return true;
    } catch {
      return false;
    }
  }

  private patchFromExperienceRow(row: any): void {
    const existingUserId = Number(
      row?.userId ??
      row?.UserId ??
      row?.userid ??
      this.currentUserId
    );
    this.editUserId = existingUserId > 0 ? existingUserId : this.currentUserId;

    this.form.patchValue({
      companyName: row?.companyName ?? row?.CompanyName ?? '',
      designation: row?.designation ?? row?.Designation ?? '',
      startDate: this.toMonthValue(row?.startDate ?? row?.StartDate ?? ''),
      endDate: this.toMonthValue(row?.endDate ?? row?.EndDate ?? ''),
      isCurrent: Boolean(row?.isCurrent ?? row?.IsCurrent ?? false),
      userId: this.editUserId
    });
  }

  private toMonthValue(value: unknown): string {
    const text = String(value ?? '').trim();
    if (!text) return '';
    if (/^\d{4}-\d{2}$/.test(text)) return text;
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 7);

    const date = new Date(text);
    if (Number.isNaN(date.getTime())) return text;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${date.getFullYear()}-${month}`;
  }

  private getActiveUser(): any {
    const fromService = this.authService.getUser();
    if (fromService?.id || (fromService as any)?.userId) return fromService;

    try {
      const stored =
        localStorage.getItem('currentUser') ||
        sessionStorage.getItem('currentUser');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed;
    } catch {
      return null;
    }
  }
}
