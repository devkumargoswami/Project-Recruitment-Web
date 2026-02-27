import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { authGuard } from '../auth/auth.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [

      // default dashboard page
      { path: '', redirectTo: 'profile', pathMatch: 'full' },

      // profile
      {
        path: 'profile',
        loadComponent: () =>
          import('../profile/profile.component')
            .then(m => m.ProfileComponent)
      },

      // education module
      {
        path: 'education',
        loadChildren: () =>
          import('../education/education.routes')
            .then(m => m.educationRoutes)
      },

      // documents module
      {
        path: 'documents',
        loadChildren: () =>
          import('../document/document.route')
            .then(m => m.documentRoutes)
      },

      // future
      // { path: 'skills', ... }
      // { path: 'users', ... }
    ]
  }
];