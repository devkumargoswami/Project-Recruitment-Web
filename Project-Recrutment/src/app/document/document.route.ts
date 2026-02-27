import { Routes } from '@angular/router';
import { DocumentComponent } from './document.component';
import { DocumentListComponent } from './document-list.component';

export const documentRoutes: Routes = [
  { path: '', component: DocumentListComponent },     // list
  { path: 'add', component: DocumentComponent },      // add
  { path: 'edit/:id', component: DocumentComponent }  // edit
];