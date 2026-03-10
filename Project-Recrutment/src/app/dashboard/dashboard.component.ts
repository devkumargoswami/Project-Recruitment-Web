import {
  Component, OnInit, Inject, PLATFORM_ID, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService, AuthUser } from '../service/auth.service';
import { DashboardService } from '../service/dashboard.service';
import { Result } from '../result/result.model';

interface NavItem {
  id?: string; icon?: string; label?: string;
  divider?: boolean; dlabel?: string; admin?: boolean;
}
interface RoleConfig {
  color: string; grad: string; badge: string;
  stats: string[]; nav: NavItem[]; actions: Record<string, string>;
}
interface Education  { educationId: number; userId: number; educationLevelId: number; schoolCollege: string; boardUniversity?: string; degree: string; startMonth: number; startYear: number; endMonth: number; endYear: number; isContinue: boolean; }
interface Skill      { id: number; name: string; level: string; }
interface Experience { id: number; company: string; position: string; duration: string; description?: string; }
interface Document   { documentId: number; userId: number; documentName: string; documentPath?: string; type?: string; uploadedAt?: string; url?: string; }

type SubDataTab = 'education' | 'skills' | 'experience' | 'documents';

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
      stats: ['Education', 'Skills', 'Experience', 'Documents', 'Results'],
      nav: [
        { id: 'profile',    icon: '&#x1F464;', label: 'Profile' },
        { id: 'education',  icon: '&#x1F393;', label: 'Education' },
        { id: 'skills',     icon: '&#x2699;',  label: 'Skills' },
        { id: 'experience', icon: '&#x1F4BC;', label: 'Experience' },
        { id: 'documents',  icon: '&#x1F4C4;', label: 'Documents' },
        { id: 'results',    icon: '&#x1F4CB;', label: 'Results' },
        { divider: true, dlabel: 'Management' },
        { id: 'users', icon: '&#x1F465;', label: 'All Users', admin: true }
      ],
      actions: {
        profile: 'Edit Profile', education: '+ Add Education', skills: '+ Add Skill',
        experience: '+ Add Experience', documents: '+ Upload Document', results: '+ Add Result', users: '+ Add User'
      }
    },
    HR: {
      color: '#fcd34d', grad: 'linear-gradient(135deg,#f59e0b,#d97706)', badge: 'badge-amber',
      stats: ['Education', 'Skills', 'Experience', 'Documents', 'Results'],
      nav: [
        { id: 'profile',    icon: '&#x1F464;', label: 'Profile' },
        { id: 'education',  icon: '&#x1F393;', label: 'Education' },
        { id: 'skills',     icon: '&#x2699;',  label: 'Skills' },
        { id: 'experience', icon: '&#x1F4BC;', label: 'Experience' },
        { id: 'documents',  icon: '&#x1F4C4;', label: 'Documents' },
        { id: 'results',    icon: '&#x1F4CB;', label: 'Results' },
        { divider: true, dlabel: 'Management' },
        { id: 'users', icon: '&#x1F465;', label: 'All Users', admin: true }
      ],
      actions: {
        profile: 'Edit Profile', education: '+ Add Education', skills: '+ Add Skill',
        experience: '+ Add Experience', documents: '+ Upload Document', results: '+ Add Result', users: '+ Add User'
      }
    },
    Employer: {
      color: '#a78bfa', grad: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', badge: 'badge-violet',
      stats: ['Skills', 'Experience', 'Documents', 'Results'],
      nav: [
        { id: 'profile',    icon: '&#x1F464;', label: 'Profile' },
        { id: 'education',  icon: '&#x1F393;', label: 'Education' },
        { id: 'skills',     icon: '&#x2699;',  label: 'Skills' },
        { id: 'experience', icon: '&#x1F4BC;', label: 'Experience' },
        { id: 'documents',  icon: '&#x1F4C4;', label: 'Documents' },
        { id: 'results',    icon: '&#x1F4CB;', label: 'Results' }
      ],
      actions: {
        profile: 'Edit Profile', education: '+ Add Education', skills: '+ Add Skill',
        experience: '+ Add Experience', documents: '+ Upload Document', results: '+ Add Result'
      }
    },
    Candidate: {
      color: '#a2e1c8', grad: 'linear-gradient(135deg,#10b981,#059669)', badge: 'badge-green',
      stats: ['Education', 'Skills', 'Documents', 'Results'],
      nav: [
        { id: 'profile',   icon: '&#x1F464;', label: 'Profile' },
        { id: 'education', icon: '&#x1F393;', label: 'Education' },
        { id: 'skills',    icon: '&#x2699;',  label: 'Skills' },
        { id: 'documents', icon: '&#x1F4C4;', label: 'Documents' },
        { id: 'results',   icon: '&#x1F4CB;', label: 'Results' }
      ],
      actions: {
        profile: 'Edit Profile', education: '+ Add Education',
        skills: '+ Add Skill', documents: '+ Upload Document', results: '+ Add Result'
      }
    }
  };

  // Sections that navigate to their own route instead of rendering inline
  private readonly ROUTED_SECTIONS: Record<string, string> = {
    skills:     '/skills',
    experience: '/experience/list',
    results:    '/results'
  };

  readonly SECTION_TITLE: Record<string, string> = {
    profile: 'Profile', education: 'Education', skills: 'Skills',
    experience: 'Work Experience', documents: 'Documents', results: 'Results', users: 'All Users'
  };

  readonly SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  readonly subTabs: SubDataTab[] = ['education', 'skills', 'experience', 'documents'];

  // ── Current user ──────────────────────────────────────────────────
  user: AuthUser | null = null;
  currentRole = '';

  // ── Own profile data ──────────────────────────────────────────────
  educationList: Education[]   = [];
  skillsList: Skill[]          = [];
  experienceList: Experience[] = [];
  documentList: Document[]     = [];
  resultList: Result[]         = [];

  // ── HR/Admin: all users ───────────────────────────────────────────
  allUsers: AuthUser[]      = [];
  filteredUsers: AuthUser[] = [];

  // ── HR/Admin: per-user data cache ─────────────────────────────────
  userDataCache = new Map<number, {
    education: Education[];
    skills: Skill[];
    experience: Experience[];
    documents: Document[];
    results: Result[];
  }>();

  // ── Sub-panel state ───────────────────────────────────────────────
  selectedUserForData: AuthUser | null = null;
  subDataTab: SubDataTab | 'results' = 'education';
  subEducation:  Education[]  = [];
  subSkills:     Skill[]      = [];
  subExperience: Experience[] = [];
  subDocuments:  Document[]   = [];
  subResults:    Result[]     = [];

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
    this.currentRole = this.normalizeRoleName(sessionUser.role) ?? 'Candidate';
    if (this.currentRole === 'HR') {
      this.currentSection = 'users';
    }
    this.loadDashboard();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  // ── Utility ───────────────────────────────────────────────────────
  toTitleCase(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

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
      documents:  this.documentList.length,
      results:    this.resultList.length
    };
    return map[s.toLowerCase()] ?? 0;
  }

  getUserDataCount(userId: number, tab: SubDataTab): number {
    return this.userDataCache.get(userId)?.[tab]?.length ?? 0;
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
  trackById(_: number, item: any): number {
    return item.id || item.educationId || item.documentId || 0;
  }

  getInitials(name?: string | null): string {
    return (name || '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  // ── Navigation ────────────────────────────────────────────────────

  /**
   * Central navigation handler.
   * Sections in ROUTED_SECTIONS navigate to their own page.
   * All other sections render inline on the dashboard.
   */
  showSection(id: string): void {
    const route = this.ROUTED_SECTIONS[id];
    if (route) {
      this.router.navigate([route]);
      return;
    }

    this.currentSection = id;
    this.sidebarOpen = false;
    this.selectedUserForData = null;

    // Refresh data for the newly active section
    switch (id) {
      case 'education': this.loadEducationData(); break;
      case 'documents': this.loadDocumentData();  break;
    }

    this.cdr.markForCheck();
  }

  handleTopAction(): void {
    const routes: Record<string, string> = {
      profile:    '/profile',
      education:  '/education',
      skills:     '/skills',
      experience: '/experience',
      documents:  '/documents',
      interview:  '/interview-schedule',
      results:    '/results',
      users:      '/user'
    };
    const route = routes[this.currentSection];
    if (route) this.router.navigate([route]);
  }

  // Convenience wrappers — all go through showSection so routing stays consistent
  goToEducation():  void { this.showSection('education');  }
  goToSkills():     void { this.showSection('skills');     }
  goToExperience(): void { this.showSection('experience'); }
  goToDocuments():  void { this.showSection('documents');  }
  goToResults():    void { this.showSection('results');    }
  goToAddUser():    void { this.showSection('users');      }

  goToInterviewSchedule():     void { this.router.navigate(['/interview-schedule']);      }
  goToInterviewScheduleList(): void { this.router.navigate(['/interview-schedule/list']); }

  // Edit routes
  editEducation(id: number):  void { this.router.navigate([`/education/edit/${id}`]);  }
  editSkill(id: number):      void { this.router.navigate([`/skills/edit/${id}`]);     }
  editExperience(id: number): void { this.router.navigate([`/experience/edit/${id}`]); }
  editDocument(id: number):   void { this.router.navigate([`/documents/edit/${id}`]);  }
  editResult(id: number):     void { this.router.navigate([`/results/edit/${id}`]);    }
  editUser(_: number):        void { this.router.navigate(['/user']);                  }

  openSidebar():  void { this.sidebarOpen = true;  this.cdr.markForCheck(); }
  closeSidebar(): void { this.sidebarOpen = false; this.cdr.markForCheck(); }

  refresh(): void { this.loadDashboard(); }

  logout(): void { this.auth.logout(); }

  // ── Sub-panel ─────────────────────────────────────────────────────
  viewUserData(user: AuthUser, tab: SubDataTab | 'results'): void {
    this.selectedUserForData = user;
    this.subDataTab = tab;
    this.loadSubPanelData(user.id);
  }

  switchSubTab(tab: string): void {
    this.subDataTab = tab as SubDataTab | 'results';
    if (this.selectedUserForData) this.syncSubArrays(this.selectedUserForData.id);
  }

  closeSubPanel(): void {
    this.selectedUserForData = null;
    this.cdr.markForCheck();
  }

  // ── User filters ──────────────────────────────────────────────────
  onUserSearch(e: Event):   void { this.userSearchTerm   = (e.target as HTMLInputElement).value;  this.applyFilters(); }
  onRoleFilter(e: Event):   void { this.userRoleFilter   = (e.target as HTMLSelectElement).value; this.applyFilters(); }
  onStatusFilter(e: Event): void { this.userStatusFilter = (e.target as HTMLSelectElement).value; this.applyFilters(); }

  // ── Delete: own data ──────────────────────────────────────────────
  async deleteEducation(id: number): Promise<void> {
    if (!confirm('Delete this education record?')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteEducation(id).pipe(takeUntil(this.destroy$)).subscribe({
      next:  () => { this.educationList  = this.educationList.filter(e => e.educationId !== id);  this.deletingId = null; this.cdr.markForCheck(); },
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
      next:  () => { this.documentList = this.documentList.filter(d => d.documentId !== id); this.deletingId = null; this.cdr.markForCheck(); },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  async deleteResult(id: number): Promise<void> {
    if (!confirm('Delete this result?')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteResult(id).pipe(takeUntil(this.destroy$)).subscribe({
      next:  () => { this.resultList = this.resultList.filter(r => r.result_id !== id); this.deletingId = null; this.cdr.markForCheck(); },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  async deleteUser(_: number): Promise<void> {
    this.router.navigate(['/user']);
  }

  // ── Delete: sub-panel data ────────────────────────────────────────
  async deleteSubEducation(id: number): Promise<void> {
    if (!confirm('Delete this education record?')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteEducation(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.subEducation = this.subEducation.filter(e => e.educationId !== id); this.patchCache('education', id); this.deletingId = null; this.cdr.markForCheck(); },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  async deleteSubSkill(id: number): Promise<void> {
    if (!confirm('Delete this skill?')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteSkill(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.subSkills = this.subSkills.filter(s => s.id !== id); this.patchCache('skills', id); this.deletingId = null; this.cdr.markForCheck(); },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  async deleteSubExperience(id: number): Promise<void> {
    if (!confirm('Delete this experience?')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteExperience(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.subExperience = this.subExperience.filter(e => e.id !== id); this.patchCache('experience', id); this.deletingId = null; this.cdr.markForCheck(); },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  async deleteSubDocument(id: number): Promise<void> {
    if (!confirm('Delete this document?')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteDocument(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.subDocuments = this.subDocuments.filter(d => d.documentId !== id); this.patchCache('documents', id); this.deletingId = null; this.cdr.markForCheck(); },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  async deleteSubResult(id: number): Promise<void> {
    if (!confirm('Delete this result?')) return;
    this.deletingId = id; this.cdr.markForCheck();
    this.dashboardService.deleteResult(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.subResults = this.subResults.filter(r => r.result_id !== id); this.patchCache('results', id); this.deletingId = null; this.cdr.markForCheck(); },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  // ── Private helpers ───────────────────────────────────────────────
  private loadDashboard(): void {
    if (!this.user?.id) return;
    this.loading = true;
    this.cdr.markForCheck();

    const dashboard$ = this.dashboardService
      .getCompleteDashboard(this.user.id)
      .pipe(catchError(err => { console.error(err); return of(null); }));

    const users$ = this.isAdminOrHR()
      ? this.dashboardService.getAllUsers().pipe(catchError(err => { console.error('Error loading users:', err); return of([]); }))
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
            this.resultList     = dashboard.results    ?? [];
          }
          this.allUsers      = (users ?? []).map((u: any) => this.mapUserFromAPI(u));
          this.filteredUsers = [...this.allUsers];
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => { console.error('Dashboard loading error:', err); this.loading = false; this.cdr.markForCheck(); }
      });
  }

  private loadEducationData(): void {
    if (!this.user?.id) return;
    this.loading = true; this.cdr.markForCheck();
    this.dashboardService.getEducationByUserId(this.user.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any[]) => { this.educationList = data; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  private loadDocumentData(): void {
    if (!this.user?.id) return;
    this.loading = true; this.cdr.markForCheck();
    this.dashboardService.getDocumentsByUserId(this.user.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any[]) => { this.documentList = data; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
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
          documents:  data?.documents  ?? [],
          results:    data?.results    ?? []
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
    this.subResults    = [...c.results];
    this.cdr.markForCheck();
  }

  private applyFilters(): void {
    const t = this.userSearchTerm.toLowerCase();
    this.filteredUsers = this.allUsers.filter(u =>
      (!t || u.name?.toLowerCase().includes(t) || u.email?.toLowerCase().includes(t)) &&
      (!this.userRoleFilter   || u.role   === this.userRoleFilter) &&
      (!this.userStatusFilter || u.status === this.userStatusFilter)
    );
    this.cdr.markForCheck();
  }

  private patchCache(tab: SubDataTab | 'results', id: number): void {
    if (!this.selectedUserForData) return;
    const cache = this.userDataCache.get(this.selectedUserForData.id);
    if (!cache) return;
    if (tab === 'education') {
      cache[tab] = (cache[tab] as any[]).filter((x: any) => x.educationId !== id) as Education[];
    } else if (tab === 'documents') {
      cache[tab] = (cache[tab] as any[]).filter((x: any) => x.documentId !== id) as Document[];
    } else if (tab === 'results') {
      cache[tab] = (cache[tab] as any[]).filter((x: any) => x.result_id !== id) as Result[];
    } else {
      cache[tab] = (cache[tab] as any[]).filter((x: any) => x.id !== id) as Skill[] & Experience[];
    }
  }

  private mapUserFromAPI(raw: any): AuthUser {
    const roleId    = raw.roleId    ?? raw.RoleId    ?? 4;
    const firstName = raw.firstName ?? raw.FirstName ?? '';
    const lastName  = raw.lastName  ?? raw.LastName  ?? '';
    return {
      id:              raw.id              ?? raw.Id,
      username:        raw.username        ?? raw.Username        ?? '',
      email:           raw.email           ?? raw.Email           ?? '',
      firstName,
      lastName,
      gender:          raw.gender          ?? raw.Gender          ?? null,
      phonenumber:     raw.phoneNumber     ?? raw.PhoneNumber     ?? null,
      dataOfBirth:     raw.dateOfBirth     ?? raw.DateOfBirth     ?? null,
      address:         raw.address         ?? raw.Address         ?? null,
      countryId:       raw.countryId       ?? raw.CountryId       ?? null,
      stateId:         raw.stateId         ?? raw.StateId         ?? null,
      city:            raw.city            ?? raw.City            ?? null,
      roleId,
      role:            this.normalizeRoleName(raw.role ?? raw.Role ?? raw.roleName ?? raw.RoleName) ?? this.getRoleName(roleId),
      offerCTC:        raw.offerCTC        ?? raw.OfferCTC        ?? null,
      totalExperience: raw.totalExperience ?? raw.TotalExperience ?? null,
      createdDateTime: raw.createdDateTime ?? raw.CreatedDateTime ?? null,
      status:          raw.status          ?? 'Active',
      name:            `${firstName} ${lastName}`.trim() || (raw.username ?? raw.Username ?? ''),
    };
  }

  private getRoleName(roleId: number): string {
    const map: Record<number, string> = { 1: 'Admin', 2: 'HR', 3: 'Candidate', 4: 'Employer' };
    return map[roleId] ?? 'Candidate';
  }

  private normalizeRoleName(role: unknown): string | null {
    const value = String(role ?? '').trim().toLowerCase();
    if (!value) return null;
    if (value === 'admin') return 'Admin';
    if (value === 'hr' || value === 'human resources') return 'HR';
    if (value === 'candidate') return 'Candidate';
    if (value === 'employer' || value === 'manager') return 'Employer';
    return null;
  }
}