import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../service/User.Service';
import { UserModel, UpdatePasswordDTO, ApiResponse } from './User.model';

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

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
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
        this.users = data;
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

    this.formData = this.emptyUser();
    this.isEditMode = false;
    this.showFormModal = true;
  }

  openEdit(user: UserModel): void {

    this.formData = {
      ...user,
      dateOfBirth: user.dateOfBirth?.split('T')[0] ?? '',
      password: ''
    };

    this.isEditMode = true;
    this.showFormModal = true;
  }

  openDelete(user: UserModel): void {

    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  openPassword(user: UserModel): void {

    this.passwordForm = {
      userId: user.id,
      newPassword: '',
      confirmPassword: ''
    };

    this.showPasswordModal = true;
  }

  submitForm(): void {

    const payload = {
      ...this.formData,
      dateOfBirth: this.formData.dateOfBirth + 'T00:00:00'
    };

    const call = this.isEditMode
      ? this.userService.updateUser(payload)
      : this.userService.insertUser(payload);

    call.subscribe({
      next: (res: ApiResponse) => {

        if (res.status === 1) {

          this.showToast(
            this.isEditMode
              ? 'User updated successfully!'
              : 'User added successfully!'
          );

          this.showFormModal = false;
          this.loadUsers();

        } else {

          this.showToast(res.message || 'Failed', 'error');
        }
      },

      error: () => this.showToast('Network error', 'error')
    });
  }

  confirmDelete(): void {

    if (!this.selectedUser) return;

    this.userService.deleteUser(this.selectedUser.id).subscribe({

      next: (res: ApiResponse) => {

        if (res.status === 1) {

          this.showToast('User deleted!');
          this.showDeleteModal = false;
          this.loadUsers();

        } else {

          this.showToast(res.message || 'Failed', 'error');
        }
      },

      error: () => this.showToast('Network error', 'error')
    });
  }

  submitPassword(): void {

    this.userService.updatePassword(this.passwordForm).subscribe({

      next: (res: ApiResponse) => {

        if (res.status === 1) {

          this.showToast('Password updated!');
          this.showPasswordModal = false;

        } else {

          this.showToast(res.message || 'Failed', 'error');
        }
      },

      error: () => this.showToast('Network error', 'error')
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

}