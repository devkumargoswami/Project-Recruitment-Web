import { Routes } from '@angular/router';
import { EducationComponent } from './education.component';
import { EducationListComponent } from './education-list.component';

export const educationRoutes: Routes = [
  { path: '', component: EducationListComponent },     // list
  { path: 'add', component: EducationComponent },      // add
  { path: 'edit/:id', component: EducationComponent }  // edit
];