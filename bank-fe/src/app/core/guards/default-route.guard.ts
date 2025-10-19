import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class DefaultRouteGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.authService.isAuthenticated) {
      // Nếu đã login, redirect đến dashboard
      return this.router.createUrlTree(['/app/dashboard']);
    } else {
      // Nếu chưa login, redirect đến login
      return this.router.createUrlTree(['/login']);
    }
  }
}
