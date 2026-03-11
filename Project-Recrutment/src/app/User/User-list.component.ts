import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../service/User.Service';  // ← service folder
import { AuthService } from '../service/auth.service'; // ← auth folder
import { UserModel, UpdatePasswordDTO, ApiResponse } from './User.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './User-list.component.html',
  styleUrls: ['./User-list.component.css']
})
export class UserListComponent implements OnInit {

  users: UserModel[] = [];
  filtered: UserModel[] = [];
  loading = false;
  searchText = '';

  currentPage = 1;
  pageSize = 8;

  sortField = 'id';
  sortDir: 'asc' | 'desc' = 'asc';

  showFormModal = false;
  showDeleteModal = false;
  showPasswordModal = false;
  isEditMode = false;

  selectedUser: UserModel | null = null;

  formData: UserModel = this.emptyUser();

  passwordForm: UpdatePasswordDTO = {
    userId: 0,
    newPassword: '',
    confirmPassword: ''
  };

  toast: { message: string; type: 'success' | 'error' } | null = null;

  // Current logged-in user info
  currentUserId = 0;
  currentUserRole = '';

  roleMap: Record<number, string> = {
    1: 'Admin',
    2: 'HR',
    3: 'Candidate',
    4: 'Manager'
  };

  statusMap: Record<number, string> = {
    0: 'Pending',
    1: 'Scheduled',
    2: 'Passed',
    3: 'Rejected'
  };

  genderOptions = ['Male', 'Female', 'Other'];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get current logged-in user
    const user = this.authService.getUser();
    if (user) {
      this.currentUserId = user.id;
      this.currentUserRole = user.role; // 'HR', 'Admin', 'Candidate', etc.
      this.loadUsers();
    } else {
      alert('Please login first');
      this.router.navigate(['/login']);
    }
  }

  emptyUser(): UserModel {
    return {
      id: 0,
      username: '',
      password: '',
      email: '',
      firstName: '',
      lastName: '',
      gender: 'Male',
      phoneNumber: undefined,
      dateOfBirth: '',
      address: '',
      countryId: undefined,
      stateId: undefined,
      city: '',
      roleId: 3,
      offerCTC: 0,
      interviewStatus: 0,
      totalExperience: undefined,
      createdDateTime: new Date().toISOString()
    };
  }

  loadUsers(): void {
    this.loading = true;

    this.userService.getUsers().subscribe({
      next: (data: UserModel[]) => {
        // Filter based on role
        if (this.currentUserRole === 'HR' || this.currentUserRole === 'Admin') {
          // HR/Admin sees all users
          this.users = data;
        } else {
          // Candidate/Other roles see only themselves
          this.users = data.filter(u => u.id === this.currentUserId);
        }
        
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.showToast('Failed to load users', 'error');
        this.loading = false;
      }
    });
  }

  applyFilter(): void {

    let data = [...this.users];

    if (this.searchText.trim()) {

      const q = this.searchText.toLowerCase();

      data = data.filter(u =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q)
      );
    }

    data.sort((a: any, b: any) => {

      const av = a[this.sortField] ?? '';
      const bv = b[this.sortField] ?? '';

      if (av < bv) return this.sortDir === 'asc' ? -1 : 1;
      if (av > bv) return this.sortDir === 'asc' ? 1 : -1;

      return 0;
    });

    this.filtered = data;
    this.currentPage = 1;
  }

  get paginatedUsers(): UserModel[] {

    const start = (this.currentPage - 1) * this.pageSize;

    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filtered.length / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  handleSort(field: string): void {

    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }

    this.applyFilter();
  }

  openAdd(): void {
    // Only HR/Admin can add new users
    if (this.currentUserRole !== 'HR' && this.currentUserRole !== 'Admin') {
      this.showToast('Only HR can add new users', 'error');
      return;
    }

    this.formData = this.emptyUser();
    this.isEditMode = false;
    this.showFormModal = true;
  }

  openEdit(user: UserModel): void {
    // Users can only edit themselves (or HR can edit anyone)
    if (this.currentUserId !== user.id && this.currentUserRole !== 'HR' && this.currentUserRole !== 'Admin') {
      this.showToast('You can only edit your own profile', 'error');
      return;
    }

    this.formData = {
      ...user,
      dateOfBirth: user.dateOfBirth?.split('T')[0] ?? '',
      password: ''
    };

    this.isEditMode = true;
    this.showFormModal = true;
  }

  openDelete(user: UserModel): void {
    // Only HR/Admin can delete
    if (this.currentUserRole !== 'HR' && this.currentUserRole !== 'Admin') {
      this.showToast('Only HR can delete users', 'error');
      return;
    }

    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  openPassword(user: UserModel): void {
    // Users can only change their own password (or HR can change anyone's)
    if (this.currentUserId !== user.id && this.currentUserRole !== 'HR' && this.currentUserRole !== 'Admin') {
      this.showToast('You can only change your own password', 'error');
      return;
    }

    this.passwordForm = {
      userId: user.id,
      newPassword: '',
      confirmPassword: ''
    };

    this.showPasswordModal = true;
  }

  private toNumberOrUndefined(value: any): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    const n = Number(value);
    return Number.isNaN(n) ? undefined : n;
  }

  private toNumberOrZero(value: any): number {
    const n = Number(value);
    return Number.isNaN(n) ? 0 : n;
  }

  private isSuccessResponse(res: any): boolean {
    if (!res) return true;
    return res.status === 1 || res.status === 200 || res.success === true || res.isSuccess === true;
  }

  submitForm(): void {

    if (!this.formData.firstName?.trim() ||
        !this.formData.lastName?.trim() ||
        !this.formData.username?.trim() ||
        !this.formData.email?.trim() ||
        !this.formData.dateOfBirth) {
      this.showToast('Please fill all required fields', 'error');
      return;
    }

    if (!this.formData.password?.trim()) {
      this.showToast('Password is required', 'error');
      return;
    }

    const dateOfBirth = this.formData.dateOfBirth.includes('T')
      ? this.formData.dateOfBirth
      : `${this.formData.dateOfBirth}T00:00:00`;

    const payload: UserModel = {
      ...this.formData,
      roleId: this.toNumberOrZero(this.formData.roleId),
      offerCTC: this.toNumberOrZero(this.formData.offerCTC),
      interviewStatus: this.toNumberOrUndefined(this.formData.interviewStatus),
      countryId: this.toNumberOrUndefined(this.formData.countryId),
      stateId: this.toNumberOrUndefined(this.formData.stateId),
      totalExperience: this.toNumberOrUndefined(this.formData.totalExperience),
      phoneNumber: this.toNumberOrUndefined(this.formData.phoneNumber),
      dateOfBirth
    };

    const call = this.isEditMode
      ? this.userService.updateUser(payload)
      : this.userService.insertUser(payload);

    call.subscribe({
      next: (res: ApiResponse | any) => {

        if (this.isSuccessResponse(res)) {

          this.showToast(
            this.isEditMode
              ? 'User updated successfully!'
              : 'User added successfully!'
          );

          this.showFormModal = false;
          this.loadUsers();

        } else {

          this.showToast(res?.message || 'Failed', 'error');
        }
      },

      error: (err) => this.showToast(err?.error?.message || err?.message || 'Network error', 'error')
    });
  }

  confirmDelete(): void {

    if (!this.selectedUser) return;

    this.userService.deleteUser(this.selectedUser.id).subscribe({

      next: (res: ApiResponse | any) => {

        if (this.isSuccessResponse(res)) {

          this.showToast('User deleted!');
          this.showDeleteModal = false;
          this.loadUsers();

        } else {

          this.showToast(res?.message || 'Failed', 'error');
        }
      },

      error: (err) => this.showToast(err?.error?.message || err?.message || 'Network error', 'error')
    });
  }

  submitPassword(): void {

    this.userService.updatePassword(this.passwordForm).subscribe({

      next: (res: ApiResponse | any) => {

        if (this.isSuccessResponse(res)) {

          this.showToast('Password updated!');
          this.showPasswordModal = false;

        } else {

          this.showToast(res?.message || 'Failed', 'error');
        }
      },

      error: (err) => this.showToast(err?.error?.message || err?.message || 'Network error', 'error')
    });
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {

    this.toast = { message, type };

    setTimeout(() => {
      this.toast = null;
    }, 3000);
  }

  avatarColor(name: string = ''): string {

    const colors = [
      '#6366f1','#8b5cf6','#ec4899','#f59e0b',
      '#10b981','#3b82f6','#ef4444','#14b8a6'
    ];

    return colors[(name.charCodeAt(0) || 0) % colors.length];
  }

  roleColor(id: number): string {

    const map: Record<number, string> = {
      1: '#ef4444',
      2: '#f59e0b',
      3: '#6366f1',
      4: '#10b981'
    };

    return map[id] || '#64748b';
  }

  statusClass(s: number): string {

    const map: Record<number, string> = {
      0: 'status-pending',
      1: 'status-scheduled',
      2: 'status-passed',
      3: 'status-rejected'
    };

    return map[s] ?? 'status-pending';
  }

  get totalUsers(): number {
    return this.users.length;
  }

  get totalCandidates(): number {
    return this.users.filter(u => u.roleId === 3).length;
  }

  get totalHR(): number {
    return this.users.filter(u => u.roleId <= 2).length;
  }

  get totalPassed(): number {
    return this.users.filter(u => u.interviewStatus === 2).length;
  }

  // Check if current user is HR/Admin (for showing add button etc)
  get isHR(): boolean {
    return this.currentUserRole === 'HR' || this.currentUserRole === 'Admin';
  }

  goBack(): void {
    this.router.navigate(['/dashboard/profile']);
  }
}
