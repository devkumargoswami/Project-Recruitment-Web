import { Routes } from '@angular/router';
import { ExperienceComponent } from './experience.component';
import { ExperienceListComponent } from './experience-list.component';

export const experienceRoutes: Routes = [
  {
    path: '',
    component: ExperienceComponent       // localhost:4200/experience → Form
  },
  {
    path: 'list',
    component: ExperienceListComponent   // localhost:4200/experience/list → List
  }
];