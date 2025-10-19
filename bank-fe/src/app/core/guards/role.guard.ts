import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private allowedRoles = ['admin', 'superadmin'];

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }

    const currentUser = this.authService.currentUser;
    if (!currentUser || !this.allowedRoles.includes(currentUser.role)) {
      this.router.navigate(['/403']);
      return false;
    }

    return true;
  }
}
