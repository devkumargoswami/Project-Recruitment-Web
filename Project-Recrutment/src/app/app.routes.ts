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

  // Dashboard
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./dashboard/dashboard.routes')
        .then(m => m.dashboardRoutes)
  },

  // Fallback
  { path: '**', redirectTo: 'login' }
];