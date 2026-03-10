import { Routes } from '@angular/router';

export const interviewScheduleRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./interview-schedule-list.component').then(
        m => m.InterviewScheduleListComponent
      )
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./interview-schedule-list.component').then(
        m => m.InterviewScheduleListComponent
      )
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./interview-schedule-form.component').then(
        m => m.InterviewScheduleComponent
      )
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./interview-schedule-form.component').then(
        m => m.InterviewScheduleComponent
      )
  }
];