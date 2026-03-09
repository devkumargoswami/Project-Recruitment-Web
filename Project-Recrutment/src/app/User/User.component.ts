import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserListComponent } from './User-list.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, UserListComponent],
  template: `<app-user-list></app-user-list>`,
  styles: [`:host { display: block; }`]
})
export class UserComponent {}