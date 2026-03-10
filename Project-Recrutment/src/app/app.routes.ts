import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth/auth.guard';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Auth
  {
    path: 'login',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./login/login.route')
        .then(m => m.loginRoutes)
  },

  // Register
  {
    path: 'register',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./register/register.route')
        .then(m => m.registerRoutes)
  },

  // Dashboard
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./dashboard/dashboard.routes')
        .then(m => m.dashboardRoutes)
  },

  // Profile
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./profile/profile.component')
        .then(m => m.ProfileComponent)
  },

  // Test Login
  {
    path: 'test-login',
    loadChildren: () =>
      import('./test-login/test-login.route')
        .then(m => m.testLoginRoutes)
  },

  // Simple Test
  {
    path: 'simple-test',
    loadChildren: () =>
      import('./simple-test/simple-test.route')
        .then(m => m.simpleTestRoutes)
  },

  // User
  {
    path: 'user',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./User/User.route')
        .then(m => m.userRoutes)
  },

  // Skill
  {
    path: 'skills',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./skill/skill.route')
        .then(m => m.skillRoutes)
  },

  // Education
  {
    path: 'education',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./education/education.routes')
        .then(m => m.educationRoutes)
  },

  // Documents
  {
    path: 'documents',
    canActivate: [authGuard],
    loadChildren: () => 
      import('./document/document.route').then(m => m.documentRoutes)
  },

  // Experience
  {
    path: 'experience',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./experience/experience.route')
        .then(m => m.experienceRoutes)
  },

  // Results
  {
    path: 'results',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./result/result.routes')
        .then(m => m.resultRoutes)
  }

];
