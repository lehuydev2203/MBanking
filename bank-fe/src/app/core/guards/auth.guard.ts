import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    console.log('🔐 AuthGuard: Checking authentication...');

    const isAuthenticated = this.authService.isAuthenticated;
    console.log('🔐 AuthGuard: Is authenticated:', isAuthenticated);

    if (isAuthenticated) {
      console.log('🔐 AuthGuard: Access granted');
      return true;
    }

    console.log('🔐 AuthGuard: Not authenticated, redirecting to login');
    this.router.navigate(['/login']);
    return false;
  }
}
