import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Injectable({ providedIn: 'root' })
export class roleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const user = this.authService.getUser();
    
    // Check if user is logged in
    if (!user || !user.id) {
      console.warn('Access denied: User not logged in');
      this.router.navigate(['/login']);
      return false;
    }

    // Get required roles from route data
    const requiredRoles: string[] = route.data['roles'] || [];
    
    // If no specific roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Check if user's role is in allowed roles
    const userRole = user.role || 'Candidate';
    
    if (requiredRoles.includes(userRole)) {
      // User has required role ✅
      return true;
    } else {
      // User doesn't have required role ❌
      console.warn(`Access denied: User role '${userRole}' not in required roles [${requiredRoles.join(', ')}]`);
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
}