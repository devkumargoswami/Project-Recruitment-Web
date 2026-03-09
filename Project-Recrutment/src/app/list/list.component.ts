import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserListService } from '../service/list.service';
import { AuthService, AuthUser } from '../auth.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  users: AuthUser[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private userListService: UserListService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.userListService.getUsers().subscribe({
      next: (data: any[]) => {
        this.loading = false;
        // Map the API response to AuthUser format with correct property names
        this.users = data.map(user => this.mapUserFromAPI(user));
        console.log('Users loaded successfully:', this.users);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error loading users: ' + err.message;
        console.error('Error loading users:', err);
      }
    });
  }

  // Custom mapping function to handle the API response structure
  private mapUserFromAPI(raw: any): AuthUser {
    const roleId = raw.roleId ?? raw.RoleId ?? 4;
    const firstName = raw.firstName ?? raw.FirstName ?? '';
    const lastName = raw.lastName ?? raw.LastName ?? '';
    return {
      id: raw.id ?? raw.Id,
      username: raw.username ?? raw.Username ?? '',
      email: raw.email ?? raw.Email ?? '',
      firstName,
      lastName, 
      gender: raw.gender ?? raw.Gender ?? null,
      phonenumber: raw.phoneNumber ?? raw.PhoneNumber ?? null, // Fixed property name
      dataOfBirth: raw.dateOfBirth ?? raw.DateOfBirth ?? null, // Fixed property name
      address: raw.address ?? raw.Address ?? null,
      countryId: raw.countryId ?? raw.CountryId ?? null,
      stateId: raw.stateId ?? raw.StateId ?? null,
      city: raw.city ?? raw.City ?? null,
      roleId,
      role: this.getRoleName(roleId),
      offerCTC: raw.offerCTC ?? raw.OfferCTC ?? null,
      totalExperience: raw.totalExperience ?? raw.TotalExperience ?? null,
      createdDateTime: raw.createdDateTime ?? raw.CreatedDateTime ?? null,
      status: raw.status ?? 'Active',
      name: `${firstName} ${lastName}`.trim() || (raw.username ?? raw.Username ?? ''),
    };
  }

  private getRoleName(roleId: number): string {
    const ROLE_MAP: Record<number, string> = {
      1: 'HR',
      2: 'Admin',
      3: 'Employer',
      4: 'Candidate'
    };
    return ROLE_MAP[roleId] ?? 'Candidate';
  }

  getInitials(user: AuthUser): string {
    const name = `${user.firstName} ${user.lastName}`.trim() || user.username || '';
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  formatDate(dateString?: string | null): string {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  }
}
