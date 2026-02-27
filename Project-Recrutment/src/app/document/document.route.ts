import { Routes } from '@angular/router';
import { DocumentComponent } from './document.component';

export const documentRoutes: Routes = [
  { path: '', component: DocumentComponent },
  { path: 'edit/:id', component: DocumentComponent }
];