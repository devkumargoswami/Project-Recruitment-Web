import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth/auth.guard';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Auth (Lazy)
  {
    path: 'login',
    canActivate: [guestGuard],   // prevents logged-in users from seeing login
    loadChildren: () =>
      import('./login/login.route')
        .then(m => m.loginRoutes)
  },

  // Dashboard (Protected + Lazy)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./dashboard/dashboard.routes')
        .then(m => m.dashboardRoutes)
  },

  // Education (Protected + Lazy)
  {
    path: 'education',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./education/education.routes')
        .then(m => m.educationRoutes)
  },

  // Documents (Protected + Lazy)
  {
    path: 'documents',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./document/document.route')
        .then(m => m.documentRoutes)
  },

  // Fallback
  { path: '**', redirectTo: 'login' }
];