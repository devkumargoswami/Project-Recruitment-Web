import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  user: User | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');

    if (!userData) {
      // If not logged in, redirect to login
      this.router.navigate(['/login']);
      return;
    }

    this.user = JSON.parse(userData);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}