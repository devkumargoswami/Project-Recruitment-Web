import { Routes } from '@angular/router';
import { ResultComponent } from './result-form.component';
import { ResultListComponent } from './result-list.component';

export const resultRoutes: Routes = [
  { path: '', component: ResultListComponent },       // /dashboard/result
  { path: 'add', component: ResultComponent },        // /dashboard/result/add
  { path: 'edit/:id', component: ResultComponent }    // /dashboard/result/edit/1
];