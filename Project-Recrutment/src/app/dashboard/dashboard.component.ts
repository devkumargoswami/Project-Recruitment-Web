// import {
//   Component, OnInit, Inject, PLATFORM_ID, OnDestroy,
//   ChangeDetectionStrategy, ChangeDetectorRef
// } from '@angular/core';
// import { CommonModule, isPlatformBrowser } from '@angular/common';
// import { Router } from '@angular/router';
// import { DashboardService } from '../service/dashboard.service';
// import { Subject, takeUntil, forkJoin, of } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { ReactiveFormsModule } from '@angular/forms';

// interface NavItem {
//   id?: string;
//   icon?: string;
//   label?: string;
//   divider?: boolean;
//   dlabel?: string;
//   admin?: boolean;
// }

// interface RoleConfig {
//   color: string;
//   grad: string;
//   badge: string;
//   stats: string[];
//   nav: NavItem[];
//   actions: Record<string, string>;
// }

// interface RoleConfigs {
//   [key: string]: RoleConfig;
// }

// interface User {
//   id: number;
//   name: string;
//   email: string;
//   role: string;
//   status?: string;
//   joinedAt?: string;
// }

// interface Education {
//   id: number;
//   title: string;
//   institution: string;
//   board?: string;
//   degree?: string;
//   year: string;
//   duration?: string;
// }

// interface Skill {
//   id: number;
//   name: string;
//   level: string;
// }

// interface Experience {
//   id: number;
//   company: string;
//   position: string;
//   duration: string;
//   description?: string;
// }

// interface Document {
//   id: number;
//   name: string;
//   type: string;
//   uploadedAt: string;
//   url?: string;
// }

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.css'],
//   changeDetection: ChangeDetectionStrategy.OnPush,
  
// })
// export class DashboardComponent implements OnInit, OnDestroy {

//   /* ───────────────── ROLE CONFIG ───────────────── */

//   readonly ROLE_CONFIG: RoleConfigs = {
//     Admin: {
//       color: '#ff4757',
//       grad: 'linear-gradient(135deg,#ff4757,#c82333)',
//       badge: 'badge-red',
//       stats: ['Education', 'Skills', 'Experience', 'Documents'],
//       nav: [
//         { id: 'profile', icon: '👤', label: 'Profile' },
//         { id: 'education', icon: '🎓', label: 'Education' },
//         { id: 'skills', icon: '⚙️', label: 'Skills' },
//         { id: 'experience', icon: '💼', label: 'Experience' },
//         { id: 'documents', icon: '📄', label: 'Documents' },
//         { divider: true, dlabel: 'Management' },
//         { id: 'users', icon: '👥', label: 'All Users', admin: true }
//       ],
//       actions: {
//         profile: 'Edit Profile',
//         education: '+ Add Education',
//         skills: '+ Add Skill',
//         experience: '+ Add Experience',
//         documents: '+ Upload Document',
//         users: '+ Add User'
//       }
//     },
//     HR: {
//       color: '#ffa502',
//       grad: 'linear-gradient(135deg,#ffa502,#d08000)',
//       badge: 'badge-orange',
//       stats: ['Education', 'Skills', 'Experience', 'Documents'],
//       nav: [
//         { id: 'profile', icon: '👤', label: 'Profile' },
//         { id: 'education', icon: '🎓', label: 'Education' },
//         { id: 'skills', icon: '⚙️', label: 'Skills' },
//         { id: 'experience', icon: '💼', label: 'Experience' },
//         { id: 'documents', icon: '📄', label: 'Documents' },
//         { divider: true, dlabel: 'Management' },
//         { id: 'users', icon: '👥', label: 'All Users', admin: true }
//       ],
//       actions: {
//         profile: 'Edit Profile',
//         education: '+ Add Education',
//         skills: '+ Add Skill',
//         experience: '+ Add Experience',
//         documents: '+ Upload Document',
//         users: '+ Add User'
//       }
//     },
//     Employer: {
//       color: '#5b8cff',
//       grad: 'linear-gradient(135deg,#5b8cff,#7c3aed)',
//       badge: 'badge-blue',
//       stats: ['Skills', 'Experience', 'Documents'],
//       nav: [
//         { id: 'profile', icon: '👤', label: 'Profile' },
//         { id: 'skills', icon: '⚙️', label: 'Skills' },
//         { id: 'experience', icon: '💼', label: 'Experience' },
//         { id: 'documents', icon: '📄', label: 'Documents' }
//       ],
//       actions: {
//         profile: 'Edit Profile',
//         skills: '+ Add Skill',
//         experience: '+ Add Experience',
//         documents: '+ Upload Document'
//       }
//     },
//     Candidate: {
//       color: '#06d6a0',
//       grad: 'linear-gradient(135deg,#06d6a0,#0ab87c)',
//       badge: 'badge-green',
//       stats: ['Education', 'Skills', 'Documents'],
//       nav: [
//         { id: 'profile', icon: '👤', label: 'Profile' },
//         { id: 'education', icon: '🎓', label: 'Education' },
//         { id: 'skills', icon: '⚙️', label: 'Skills' },
//         { id: 'documents', icon: '📄', label: 'Documents' }
//       ],
//       actions: {
//         profile: 'Edit Profile',
//         education: '+ Add Education',
//         skills: '+ Add Skill',
//         documents: '+ Upload Document'
//       }
//     }
//   };

//   readonly SECTION_TITLE: Record<string, string> = {
//     profile: 'Profile',
//     education: 'Education',
//     skills: 'Skills',
//     experience: 'Experience',
//     documents: 'Documents',
//     users: 'All Users'
//   };

//   readonly SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

//   /* ───────────────── STATE ───────────────── */

//   user: User | null = null;
//   currentRole = 'Candidate';

//   educationList: Education[] = [];
//   skillsList: Skill[] = [];
//   experienceList: Experience[] = [];
//   documentList: Document[] = [];

//   allUsers: User[] = [];
//   filteredUsers: User[] = [];

//   loading = false;
//   deletingId: number | null = null;

//   sidebarOpen = false;
//   drawerOpen = false;
//   selectedUser: User | null = null;

//   currentSection = 'profile';

//   userSearchTerm = '';
//   userRoleFilter = '';
//   userStatusFilter = '';

//   private destroy$ = new Subject<void>();

//   constructor(
//     private dashboardService: DashboardService,
//     private router: Router,
//     private cdr: ChangeDetectorRef,
//     @Inject(PLATFORM_ID) private platformId: Object
//   ) {}

//   /* ───────────────── LIFECYCLE ───────────────── */

//   ngOnInit(): void {
//     this.initializeComponent();
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   /* ───────────────── INIT ───────────────── */

//   private initializeComponent(): void {
//     if (!isPlatformBrowser(this.platformId)) return;

//     const parsedUser = this.getStoredUser();

//     if (!parsedUser?.id) {
//       this.safeNavigate('/login');
//       return;
//     }

//     this.user = parsedUser;
//     this.currentRole = parsedUser.role || 'Candidate';

//     this.loadCompleteDashboard();
//   }

//   private getStoredUser(): User | null {
//     try {
//       const raw = localStorage.getItem('user');
//       return raw ? JSON.parse(raw) as User : null;
//     } catch {
//       return null;
//     }
//   }

//   /* ───────────────── DATA LOAD ───────────────── */

//   private loadCompleteDashboard(): void {
//     if (!this.user?.id) return;

//     this.loading = true;
//     this.cdr.markForCheck();

//     const dashboard$ = this.dashboardService
//       .getCompleteDashboard(this.user.id)
//       .pipe(catchError(() => of(null)));

//     const users$ = this.isAdminOrHR()
//       ? this.dashboardService.getAllUsers().pipe(catchError(() => of([])))
//       : of([]);

//     forkJoin({ dashboard: dashboard$, users: users$ })
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(({ dashboard, users }) => {

//         if (dashboard) {
//           this.educationList = dashboard.education ?? [];
//           this.skillsList = dashboard.skills ?? [];
//           this.experienceList = dashboard.experience ?? [];
//           this.documentList = dashboard.documents ?? [];
//         }

//         this.allUsers = users as User[];
//         this.filteredUsers = [...this.allUsers];

//         this.loading = false;
//         this.cdr.markForCheck();
//       });
//   }

//   /* ───────────────── COMPUTED ───────────────── */

//   get roleConfig(): RoleConfig {
//     return this.ROLE_CONFIG[this.currentRole] ?? this.ROLE_CONFIG['Candidate'];
//   }

//   get filteredNavItems(): NavItem[] {
//     return this.roleConfig.nav.filter(item =>
//       !item.admin || this.isAdminOrHR()
//     );
//   }

//   get currentSectionTitle(): string {
//     return this.SECTION_TITLE[this.currentSection] ?? 'Dashboard';
//   }

//   get currentActionText(): string {
//     return this.roleConfig.actions[this.currentSection] ?? '';
//   }

//   getStatCount(section: string): number {
//     const map: Record<string, number> = {
//       education: this.educationList.length,
//       skills: this.skillsList.length,
//       experience: this.experienceList.length,
//       documents: this.documentList.length
//     };
//     return map[section.toLowerCase()] ?? 0;
//   }

//   isAdminOrHR(): boolean {
//     return ['Admin', 'HR'].includes(this.currentRole);
//   }

//   trackById(_: number, item: { id: number }): number {
//     return item.id;
//   }

//   /* ───────────────── FILTERING ───────────────── */

//   private applyUserFilters(): void {
//     const term = this.userSearchTerm.trim().toLowerCase();

//     this.filteredUsers = this.allUsers.filter(u =>
//       (!term || u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)) &&
//       (!this.userRoleFilter || u.role === this.userRoleFilter) &&
//       (!this.userStatusFilter || u.status === this.userStatusFilter)
//     );

//     this.cdr.markForCheck();
//   }

//   onUserSearch(e: Event): void {
//     this.userSearchTerm = (e.target as HTMLInputElement).value;
//     this.applyUserFilters();
//   }

//   onRoleFilter(e: Event): void {
//     this.userRoleFilter = (e.target as HTMLSelectElement).value;
//     this.applyUserFilters();
//   }

//   onStatusFilter(e: Event): void {
//     this.userStatusFilter = (e.target as HTMLSelectElement).value;
//     this.applyUserFilters();
//   }

//   /* ───────────────── DELETE (GENERIC) ───────────────── */

//   private handleDelete<T>(
//     id: number,
//     serviceCall: any,
//     list: T[],
//     setter: (updated: T[]) => void
//   ): void {
//     if (!confirm('Are you sure you want to delete this record?')) return;

//     this.deletingId = id;
//     this.cdr.markForCheck();

//     serviceCall.pipe(takeUntil(this.destroy$)).subscribe({
//       next: () => {
//         setter(list.filter((item: any) => item.id !== id));
//         this.deletingId = null;
//         this.cdr.markForCheck();
//       },
//       error: () => {
//         this.deletingId = null;
//         this.cdr.markForCheck();
//       }
//     });
//   }

//   deleteEducation(id: number): void {
//     this.handleDelete(id,
//       this.dashboardService.deleteEducation(id),
//       this.educationList,
//       updated => this.educationList = updated
//     );
//   }

//   deleteSkill(id: number): void {
//     this.handleDelete(id,
//       this.dashboardService.deleteSkill(id),
//       this.skillsList,
//       updated => this.skillsList = updated
//     );
//   }

//   deleteExperience(id: number): void {
//     this.handleDelete(id,
//       this.dashboardService.deleteExperience(id),
//       this.experienceList,
//       updated => this.experienceList = updated
//     );
//   }

//   deleteDocument(id: number): void {
//     this.handleDelete(id,
//       this.dashboardService.deleteDocument(id),
//       this.documentList,
//       updated => this.documentList = updated
//     );
//   }

//   /* ───────────────── NAVIGATION ───────────────── */

//   private safeNavigate(path: string): void {
//     this.router.navigate([path]);
//   }

//   logout(): void {
//     if (isPlatformBrowser(this.platformId)) {
//       localStorage.removeItem('user');
//       localStorage.removeItem('token');
//     }
//     this.safeNavigate('/login');
//   }

//   refresh(): void {
//     this.loadCompleteDashboard();
//   }
// }

import {
  Component, OnInit, Inject, PLATFORM_ID, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService, AuthUser } from '../auth.service';
import { DashboardService } from '../service/dashboard.service';

interface NavItem {
  id?: string; icon?: string; label?: string;
  divider?: boolean; dlabel?: string; admin?: boolean;
}
interface RoleConfig {
  color: string; grad: string; badge: string;
  stats: string[]; nav: NavItem[]; actions: Record<string, string>;
}
interface Education  { id: number; title: string; institution: string; board?: string; degree?: string; year: string; duration?: string; }
interface Skill      { id: number; name: string; level: string; }
interface Experience { id: number; company: string; position: string; duration: string; description?: string; }
interface Document   { id: number; name: string; type: string; uploadedAt: string; url?: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {

  readonly ROLE_CONFIG: Record<string, RoleConfig> = {
    Admin: {
      color: '#60a5fa', grad: 'linear-gradient(135deg,#3b82f6,#6366f1)', badge: 'badge-blue',
      stats: ['Education','Skills','Experience','Documents'],
      nav: [
        { id:'profile', icon:'👤', label:'Profile' },
        { id:'education', icon:'🎓', label:'Education' },
        { id:'skills', icon:'⚙️', label:'Skills' },
        { id:'experience', icon:'💼', label:'Experience' },
        { id:'documents', icon:'📄', label:'Documents' },
        { divider:true, dlabel:'Management' },
        { id:'users', icon:'👥', label:'All Users', admin:true }
      ],
      actions: { profile:'Edit Profile', education:'+ Add Education', skills:'+ Add Skill', experience:'+ Add Experience', documents:'+ Upload Document', users:'+ Add User' }
    },
    HR: {
      color: '#fcd34d', grad: 'linear-gradient(135deg,#f59e0b,#d97706)', badge: 'badge-amber',
      stats: ['Education','Skills','Experience','Documents'],
      nav: [
        { id:'profile', icon:'👤', label:'Profile' },
        { id:'education', icon:'🎓', label:'Education' },
        { id:'skills', icon:'⚙️', label:'Skills' },
        { id:'experience', icon:'💼', label:'Experience' },
        { id:'documents', icon:'📄', label:'Documents' },
        { divider:true, dlabel:'Management' },
        { id:'users', icon:'👥', label:'All Users', admin:true }
      ],
      actions: { profile:'Edit Profile', education:'+ Add Education', skills:'+ Add Skill', experience:'+ Add Experience', documents:'+ Upload Document', users:'+ Add User' }
    },
    Employer: {
      color: '#a78bfa', grad: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', badge: 'badge-violet',
      stats: ['Skills','Experience','Documents'],
      nav: [
        { id:'profile', icon:'👤', label:'Profile' },
        { id:'skills', icon:'⚙️', label:'Skills' },
        { id:'experience', icon:'💼', label:'Experience' },
        { id:'documents', icon:'📄', label:'Documents' }
      ],
      actions: { profile:'Edit Profile', skills:'+ Add Skill', experience:'+ Add Experience', documents:'+ Upload Document' }
    },
    Candidate: {
      color: '#6ee7b7', grad: 'linear-gradient(135deg,#10b981,#059669)', badge: 'badge-green',
      stats: ['Education','Skills','Documents'],
      nav: [
        { id:'profile', icon:'👤', label:'Profile' },
        { id:'education', icon:'🎓', label:'Education' },
        { id:'skills', icon:'⚙️', label:'Skills' },
        { id:'documents', icon:'📄', label:'Documents' }
      ],
      actions: { profile:'Edit Profile', education:'+ Add Education', skills:'+ Add Skill', documents:'+ Upload Document' }
    }
  };

  readonly SECTION_TITLE: Record<string, string> = {
    profile:'Profile', education:'Education', skills:'Skills',
    experience:'Work Experience', documents:'Documents', users:'All Users'
  };
  readonly SKILL_LEVELS = ['Beginner','Intermediate','Advanced','Expert'];

  user: AuthUser | null = null;
  currentRole = '';
  educationList: Education[]   = [];
  skillsList: Skill[]          = [];
  experienceList: Experience[] = [];
  documentList: Document[]     = [];
  allUsers: AuthUser[]         = [];
  filteredUsers: AuthUser[]    = [];

  loading = false;
  deletingId: number | null = null;
  currentSection = 'profile';
  sidebarOpen = false;
  drawerOpen = false;
  selectedUser: AuthUser | null = null;
  userSearchTerm = '';
  userRoleFilter = '';
  userStatusFilter = '';

  private destroy$ = new Subject<void>();

  constructor(
    private auth: AuthService,
    private dashboardService: DashboardService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // AuthGuard already checked — just read session
    const sessionUser = this.auth.getUser();
    if (!sessionUser) { this.router.navigate(['/login']); return; }
    this.user = sessionUser;
    this.currentRole = sessionUser.role || 'Candidate';
    this.loadDashboard();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  private loadDashboard(): void {
    if (!this.user?.id) return;
    this.loading = true; this.cdr.markForCheck();

    const dashboard$ = this.dashboardService.getCompleteDashboard(this.user.id)
      .pipe(catchError(err => { console.error(err); return of(null); }));

    const users$ = this.isAdminOrHR()
      ? this.dashboardService.getAllUsers().pipe(catchError(() => of([])))
      : of([]);

    forkJoin({ dashboard: dashboard$, users: users$ })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ dashboard, users }) => {
          if (dashboard) {
            this.educationList  = dashboard.education  ?? [];
            this.skillsList     = dashboard.skills     ?? [];
            this.experienceList = dashboard.experience ?? [];
            this.documentList   = dashboard.documents  ?? [];
          }
          this.allUsers = (users ?? []) as AuthUser[];
          this.filteredUsers = [...this.allUsers];
          this.loading = false; this.cdr.markForCheck();
        },
        error: () => { this.loading = false; this.cdr.markForCheck(); }
      });
  }

  refresh(): void { this.loadDashboard(); }

  get roleConfig(): RoleConfig { return this.ROLE_CONFIG[this.currentRole] || this.ROLE_CONFIG['Candidate']; }
  get filteredNavItems(): NavItem[] { return this.roleConfig.nav.filter(i => !i.admin || this.isAdminOrHR()); }
  get currentSectionTitle(): string { return this.SECTION_TITLE[this.currentSection] || 'Dashboard'; }
  get currentActionText(): string { return this.roleConfig.actions[this.currentSection] || ''; }

  isAdminOrHR(): boolean { return ['Admin','HR'].includes(this.currentRole); }

  getStatCount(s: string): number {
    const map: Record<string, number> = {
      education: this.educationList.length, skills: this.skillsList.length,
      experience: this.experienceList.length, documents: this.documentList.length
    };
    return map[s.toLowerCase()] ?? 0;
  }

  getSkillLevelWidth(level: string): string {
    const idx = this.SKILL_LEVELS.findIndex(l => l.toLowerCase() === level?.toLowerCase());
    return idx === -1 ? '25%' : `${((idx + 1) / this.SKILL_LEVELS.length) * 100}%`;
  }

  getSkillLevelColor(level: string): string {
    const map: Record<string, string> = { beginner:'#fbbf24', intermediate:'#60a5fa', advanced:'#34d399', expert:'#f87171' };
    return map[level?.toLowerCase()] || '#888';
  }

  trackById(_: number, item: { id: number }): number { return item.id; }

  getInitials(name?: string | null): string {
    return (name || '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  showSection(id: string): void { this.currentSection = id; this.sidebarOpen = false; this.cdr.markForCheck(); }

  handleTopAction(): void {
    const routes: Record<string, string> = {
      profile:'/profile', education:'/education', skills:'/skills',
      experience:'/experience', documents:'/documents', users:'/users/add'
    };
    if (routes[this.currentSection]) this.router.navigate([routes[this.currentSection]]);
  }

  goToEducation():  void { this.router.navigate(['/education']); }
  goToSkills():     void { this.router.navigate(['/skills']); }
  goToExperience(): void { this.router.navigate(['/experience']); }
  goToDocuments():  void { this.router.navigate(['/documents']); }
  goToAddUser():    void { this.router.navigate(['/users/add']); }
  editEducation(id: number):  void { this.router.navigate([`/education/edit/${id}`]); }
  editSkill(id: number):      void { this.router.navigate([`/skills/edit/${id}`]); }
  editExperience(id: number): void { this.router.navigate([`/experience/edit/${id}`]); }
  editDocument(id: number):   void { this.router.navigate([`/documents/edit/${id}`]); }
  editUser(id: number):       void { this.router.navigate([`/users/edit/${id}`]); }

  openSidebar():  void { this.sidebarOpen = true;  this.cdr.markForCheck(); }
  closeSidebar(): void { this.sidebarOpen = false; this.cdr.markForCheck(); }

  openUserDrawer(user: AuthUser): void { this.selectedUser = user; this.drawerOpen = true; this.cdr.markForCheck(); }
  closeDrawer(): void { this.drawerOpen = false; this.selectedUser = null; this.cdr.markForCheck(); }

  onUserSearch(e: Event): void { this.userSearchTerm = (e.target as HTMLInputElement).value; this.applyFilters(); }
  onRoleFilter(e: Event): void { this.userRoleFilter = (e.target as HTMLSelectElement).value; this.applyFilters(); }
  onStatusFilter(e: Event): void { this.userStatusFilter = (e.target as HTMLSelectElement).value; this.applyFilters(); }

  private applyFilters(): void {
    const t = this.userSearchTerm.toLowerCase();
    this.filteredUsers = this.allUsers.filter(u =>
      (!t || u.name?.toLowerCase().includes(t) || u.email?.toLowerCase().includes(t)) &&
      (!this.userRoleFilter || u.role === this.userRoleFilter) &&
      (!this.userStatusFilter || u.status === this.userStatusFilter)
    );
    this.cdr.markForCheck();
  }

  async deleteEducation(id: number): Promise<void> {
    if (!confirm('Delete this education record?')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteEducation(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.educationList = this.educationList.filter(e => e.id !== id); this.deletingId = null; this.cdr.markForCheck(); },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  async deleteSkill(id: number): Promise<void> {
    if (!confirm('Delete this skill?')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteSkill(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.skillsList = this.skillsList.filter(s => s.id !== id); this.deletingId = null; this.cdr.markForCheck(); },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  async deleteExperience(id: number): Promise<void> {
    if (!confirm('Delete this experience?')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteExperience(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.experienceList = this.experienceList.filter(e => e.id !== id); this.deletingId = null; this.cdr.markForCheck(); },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  async deleteDocument(id: number): Promise<void> {
    if (!confirm('Delete this document?')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteDocument(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.documentList = this.documentList.filter(d => d.id !== id); this.deletingId = null; this.cdr.markForCheck(); },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  // No JWT — AuthService just clears localStorage user and navigates to /login
  logout(): void { this.auth.logout(); }
}