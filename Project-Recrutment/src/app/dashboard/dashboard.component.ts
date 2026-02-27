// dashboard.component.ts
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
interface Education  { id: number; title: string; institution: string; board?: string; year: string; duration?: string; }
interface Skill      { id: number; name: string; level: string; }
interface Experience { id: number; company: string; position: string; duration: string; description?: string; }
interface Document   { id: number; name: string; type: string; uploadedAt: string; url?: string; }

type SubDataTab = 'education' | 'skills' | 'experience' | 'documents';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],   // <-- TitleCasePipe removed; use toTitleCase() method instead
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {

  readonly ROLE_CONFIG: Record<string, RoleConfig> = {
    Admin: {
      color: '#60a5fa', grad: 'linear-gradient(135deg,#3b82f6,#6366f1)', badge: 'badge-blue',
      stats: ['Education', 'Skills', 'Experience', 'Documents'],
      nav: [
        { id: 'profile',    icon: '&#x1F464;', label: 'Profile' },
        { id: 'education',  icon: '&#x1F393;', label: 'Education' },
        { id: 'skills',     icon: '&#x2699;',  label: 'Skills' },
        { id: 'experience', icon: '&#x1F4BC;', label: 'Experience' },
        { id: 'documents',  icon: '&#x1F4C4;', label: 'Documents' },
        { divider: true, dlabel: 'Management' },
        { id: 'users', icon: '&#x1F465;', label: 'All Users', admin: true }
      ],
      actions: {
        profile: 'Edit Profile', education: '+ Add Education', skills: '+ Add Skill',
        experience: '+ Add Experience', documents: '+ Upload Document', users: '+ Add User'
      }
    },
    HR: {
      color: '#fcd34d', grad: 'linear-gradient(135deg,#f59e0b,#d97706)', badge: 'badge-amber',
      stats: ['Education', 'Skills', 'Experience', 'Documents'],
      nav: [
        { id: 'profile',    icon: '&#x1F464;', label: 'Profile' },
        { id: 'education',  icon: '&#x1F393;', label: 'Education' },
        { id: 'skills',     icon: '&#x2699;',  label: 'Skills' },
        { id: 'experience', icon: '&#x1F4BC;', label: 'Experience' },
        { id: 'documents',  icon: '&#x1F4C4;', label: 'Documents' },
        { divider: true, dlabel: 'Management' },
        { id: 'users', icon: '&#x1F465;', label: 'All Users', admin: true }
      ],
      actions: {
        profile: 'Edit Profile', education: '+ Add Education', skills: '+ Add Skill',
        experience: '+ Add Experience', documents: '+ Upload Document', users: '+ Add User'
      }
    },
    Employer: {
      color: '#a78bfa', grad: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', badge: 'badge-violet',
      stats: ['Skills', 'Experience', 'Documents'],
      nav: [
        { id: 'profile',    icon: '&#x1F464;', label: 'Profile' },
        { id: 'education',  icon: '&#x1F393;', label: 'Education' },
        { id: 'skills',     icon: '&#x2699;',  label: 'Skills' },
        { id: 'experience', icon: '&#x1F4BC;', label: 'Experience' },
        { id: 'documents',  icon: '&#x1F4C4;', label: 'Documents' }
      ],
      actions: {
        profile: 'Edit Profile', education: '+ Add Education', skills: '+ Add Skill',
        experience: '+ Add Experience', documents: '+ Upload Document'
      }
    },
    Candidate: {
      color: '#6ee7b7', grad: 'linear-gradient(135deg,#10b981,#059669)', badge: 'badge-green',
      stats: ['Education', 'Skills', 'Documents'],
      nav: [
        { id: 'profile',   icon: '&#x1F464;', label: 'Profile' },
        { id: 'education', icon: '&#x1F393;', label: 'Education' },
        { id: 'skills',    icon: '&#x2699;',  label: 'Skills' },
        { id: 'documents', icon: '&#x1F4C4;', label: 'Documents' }
      ],
      actions: {
        profile: 'Edit Profile', education: '+ Add Education',
        skills: '+ Add Skill', documents: '+ Upload Document'
      }
    }
  };

  readonly SECTION_TITLE: Record<string, string> = {
    profile: 'Profile', education: 'Education', skills: 'Skills',
    experience: 'Work Experience', documents: 'Documents', users: 'All Users'
  };

  readonly SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  /** Sub-panel tab list exposed to template */
  readonly subTabs: SubDataTab[] = ['education', 'skills', 'experience', 'documents'];

  // ── Current user ──────────────────────────────────────────────────
  user: AuthUser | null = null;
  currentRole = '';

  // ── Own profile data ──────────────────────────────────────────────
  educationList: Education[]   = [];
  skillsList: Skill[]          = [];
  experienceList: Experience[] = [];
  documentList: Document[]     = [];

  // ── HR/Admin: all users ───────────────────────────────────────────
  allUsers: AuthUser[]      = [];
  filteredUsers: AuthUser[] = [];

  // ── HR/Admin: per-user data cache ─────────────────────────────────
  userDataCache = new Map<number, {
    education: Education[];
    skills: Skill[];
    experience: Experience[];
    documents: Document[];
  }>();

  // ── Sub-panel state ───────────────────────────────────────────────
  selectedUserForData: AuthUser | null = null;
  subDataTab: SubDataTab = 'education';
  subEducation:  Education[]  = [];
  subSkills:     Skill[]      = [];
  subExperience: Experience[] = [];
  subDocuments:  Document[]   = [];

  // ── UI state ──────────────────────────────────────────────────────
  loading          = false;
  deletingId: number | null = null;
  currentSection   = 'profile';
  sidebarOpen      = false;
  userSearchTerm   = '';
  userRoleFilter   = '';
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
    const sessionUser = this.auth.getUser();
    if (!sessionUser) { this.router.navigate(['/login']); return; }
    this.user = sessionUser;
    // ✅ Always read role from session — fixes "shows as Candidate" bug
    this.currentRole = sessionUser.role ?? 'Candidate';
    this.loadDashboard();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  // ── Utility: replaces | titlecase pipe ───────────────────────────
  toTitleCase(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  // ── Data loading ──────────────────────────────────────────────────
  private loadDashboard(): void {
    if (!this.user?.id) return;
    this.loading = true;
    this.cdr.markForCheck();

    const dashboard$ = this.dashboardService
      .getCompleteDashboard(this.user.id)
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
          this.allUsers      = (users ?? []) as AuthUser[];
          this.filteredUsers = [...this.allUsers];
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => { this.loading = false; this.cdr.markForCheck(); }
      });
  }

  refresh(): void { this.loadDashboard(); }

  // ── Getters ───────────────────────────────────────────────────────
  get roleConfig(): RoleConfig {
    return this.ROLE_CONFIG[this.currentRole] || this.ROLE_CONFIG['Candidate'];
  }
  get filteredNavItems(): NavItem[] {
    return this.roleConfig.nav.filter(i => !i.admin || this.isAdminOrHR());
  }
  get currentSectionTitle(): string {
    return this.SECTION_TITLE[this.currentSection] || 'Dashboard';
  }
  get currentActionText(): string {
    return this.roleConfig.actions[this.currentSection] || '';
  }

  isAdminOrHR(): boolean { return ['Admin', 'HR'].includes(this.currentRole); }

  // ── Stat counts ───────────────────────────────────────────────────
  getStatCount(s: string): number {
    const map: Record<string, number> = {
      education:  this.educationList.length,
      skills:     this.skillsList.length,
      experience: this.experienceList.length,
      documents:  this.documentList.length
    };
    return map[s.toLowerCase()] ?? 0;
  }

  getUserDataCount(userId: number, tab: SubDataTab): number {
    return this.userDataCache.get(userId)?.[tab]?.length ?? 0;
  }

  // ── Sub-panel ─────────────────────────────────────────────────────
  viewUserData(user: AuthUser, tab: SubDataTab): void {
    this.selectedUserForData = user;
    this.subDataTab = tab;
    this.loadSubPanelData(user.id);
  }

  switchSubTab(tab: string): void {
    this.subDataTab = tab as SubDataTab;
    if (this.selectedUserForData) this.syncSubArrays(this.selectedUserForData.id);
  }

  closeSubPanel(): void {
    this.selectedUserForData = null;
    this.cdr.markForCheck();
  }

  private loadSubPanelData(userId: number): void {
    if (this.userDataCache.has(userId)) { this.syncSubArrays(userId); return; }
    this.dashboardService.getCompleteDashboard(userId)
      .pipe(catchError(() => of(null)), takeUntil(this.destroy$))
      .subscribe(data => {
        this.userDataCache.set(userId, {
          education:  data?.education  ?? [],
          skills:     data?.skills     ?? [],
          experience: data?.experience ?? [],
          documents:  data?.documents  ?? []
        });
        this.syncSubArrays(userId);
      });
  }

  private syncSubArrays(userId: number): void {
    const c = this.userDataCache.get(userId);
    if (!c) return;
    this.subEducation  = [...c.education];
    this.subSkills     = [...c.skills];
    this.subExperience = [...c.experience];
    this.subDocuments  = [...c.documents];
    this.cdr.markForCheck();
  }

  // ── Skill helpers ─────────────────────────────────────────────────
  getSkillLevelWidth(level: string): string {
    const idx = this.SKILL_LEVELS.findIndex(l => l.toLowerCase() === level?.toLowerCase());
    return idx === -1 ? '25%' : `${((idx + 1) / this.SKILL_LEVELS.length) * 100}%`;
  }

  getSkillLevelColor(level: string): string {
    const map: Record<string, string> = {
      beginner: '#fbbf24', intermediate: '#60a5fa',
      advanced: '#34d399', expert: '#f87171'
    };
    return map[level?.toLowerCase()] || '#888';
  }

  // ── Misc helpers ──────────────────────────────────────────────────
  trackById(_: number, item: { id: number }): number { return item.id; }

  getInitials(name?: string | null): string {
    return (name || '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  // ── Navigation ────────────────────────────────────────────────────
  showSection(id: string): void {
    this.currentSection = id;
    this.sidebarOpen = false;
    this.selectedUserForData = null;
    this.cdr.markForCheck();
  }

  handleTopAction(): void {
    const routes: Record<string, string> = {
      profile: '/profile', education: '/education', skills: '/skills',
      experience: '/experience', documents: '/documents', users: '/users/add'
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

  // ── User filters ──────────────────────────────────────────────────
  onUserSearch(e: Event):   void { this.userSearchTerm   = (e.target as HTMLInputElement).value;   this.applyFilters(); }
  onRoleFilter(e: Event):   void { this.userRoleFilter   = (e.target as HTMLSelectElement).value;  this.applyFilters(); }
  onStatusFilter(e: Event): void { this.userStatusFilter = (e.target as HTMLSelectElement).value;  this.applyFilters(); }

  private applyFilters(): void {
    const t = this.userSearchTerm.toLowerCase();
    this.filteredUsers = this.allUsers.filter(u =>
      (!t || u.name?.toLowerCase().includes(t) || u.email?.toLowerCase().includes(t)) &&
      (!this.userRoleFilter   || u.role   === this.userRoleFilter)   &&
      (!this.userStatusFilter || u.status === this.userStatusFilter)
    );
    this.cdr.markForCheck();
  }

  // ── Delete: own data ──────────────────────────────────────────────
  async deleteEducation(id: number): Promise<void> {
    if (!confirm('Delete this education record?')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteEducation(id).pipe(takeUntil(this.destroy$)).subscribe({
      next:  () => { this.educationList  = this.educationList.filter(e => e.id !== id);  this.deletingId = null; this.cdr.markForCheck(); },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  async deleteSkill(id: number): Promise<void> {
    if (!confirm('Delete this skill?')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteSkill(id).pipe(takeUntil(this.destroy$)).subscribe({
      next:  () => { this.skillsList = this.skillsList.filter(s => s.id !== id); this.deletingId = null; this.cdr.markForCheck(); },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  async deleteExperience(id: number): Promise<void> {
    if (!confirm('Delete this experience?')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteExperience(id).pipe(takeUntil(this.destroy$)).subscribe({
      next:  () => { this.experienceList = this.experienceList.filter(e => e.id !== id); this.deletingId = null; this.cdr.markForCheck(); },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  async deleteDocument(id: number): Promise<void> {
    if (!confirm('Delete this document?')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteDocument(id).pipe(takeUntil(this.destroy$)).subscribe({
      next:  () => { this.documentList = this.documentList.filter(d => d.id !== id); this.deletingId = null; this.cdr.markForCheck(); },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  // ── Delete: user row ──────────────────────────────────────────────
  async deleteUser(id: number): Promise<void> {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteUser(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.allUsers      = this.allUsers.filter(u => u.id !== id);
        this.filteredUsers = this.filteredUsers.filter(u => u.id !== id);
        this.userDataCache.delete(id);
        if (this.selectedUserForData?.id === id) this.selectedUserForData = null;
        this.deletingId = null; this.cdr.markForCheck();
      },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  // ── Delete: sub-panel data ────────────────────────────────────────
  async deleteSubEducation(id: number): Promise<void> {
    if (!confirm('Delete this education record?')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteEducation(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.subEducation = this.subEducation.filter(e => e.id !== id);
        this.patchCache('education', id);
        this.deletingId = null; this.cdr.markForCheck();
      },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  async deleteSubSkill(id: number): Promise<void> {
    if (!confirm('Delete this skill?')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteSkill(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.subSkills = this.subSkills.filter(s => s.id !== id);
        this.patchCache('skills', id);
        this.deletingId = null; this.cdr.markForCheck();
      },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  async deleteSubExperience(id: number): Promise<void> {
    if (!confirm('Delete this experience?')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteExperience(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.subExperience = this.subExperience.filter(e => e.id !== id);
        this.patchCache('experience', id);
        this.deletingId = null; this.cdr.markForCheck();
      },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  async deleteSubDocument(id: number): Promise<void> {
    if (!confirm('Delete this document?')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteDocument(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.subDocuments = this.subDocuments.filter(d => d.id !== id);
        this.patchCache('documents', id);
        this.deletingId = null; this.cdr.markForCheck();
      },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  private patchCache(tab: SubDataTab, id: number): void {
    if (!this.selectedUserForData) return;
    const cache = this.userDataCache.get(this.selectedUserForData.id);
    if (cache) (cache[tab] as any[]) = (cache[tab] as any[]).filter((x: any) => x.id !== id);
  }

  logout(): void { this.auth.logout(); }
}