import { Routes } from '@angular/router';
import { ExperienceFormComponent } from './experience-form.component';
import { ExperienceListComponent } from './experience-list.route';

export const experienceRoutes: Routes = [
  {
    path: '',
    component: ExperienceListComponent
  },
  {
    path: 'list',
    component: ExperienceListComponent
  },
  {
    path: 'add',
    component: ExperienceFormComponent
  },
  {
    path: 'edit/:id',
    component: ExperienceFormComponent
  }
];
