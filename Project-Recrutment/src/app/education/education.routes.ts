import { Routes } from '@angular/router';
import { EducationComponent } from './education.component';

export const educationRoutes: Routes = [
  { path: '', component: EducationComponent },
  { path: 'edit/:id', component: EducationComponent }
];