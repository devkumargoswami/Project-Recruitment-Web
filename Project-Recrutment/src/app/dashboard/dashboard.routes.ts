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
      // results module
      {
        path: 'results',
        loadChildren: () =>
          import('../result/result.routes')
            .then(m => m.resultRoutes)
      },
      // skills module
      {
        path: 'skills',
        loadChildren: () =>
          import('../skill/skill.route')
            .then(m => m.skillRoutes)
      }
    ]
  }
];
