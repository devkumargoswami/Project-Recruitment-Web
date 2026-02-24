import { Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { RegisterComponent } from '../register/register.component';
import{ FrogotPasswordComponent } from '../frogot-password/frogot-password.component';

export const loginRoutes: Routes = [
  {
    path: '',          // Base path for login module
    children: [
      { path: '', component: LoginComponent },               // /login
      { path: 'register', component: RegisterComponent },    // /login/register
      { path: 'forgot-password', component: FrogotPasswordComponent } // /login/forgot-password
    ]
  }
];