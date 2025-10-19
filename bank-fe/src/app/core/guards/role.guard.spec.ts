import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated'], {
      currentUser: null,
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(RoleGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should redirect to login if not authenticated', () => {
    authService.isAuthenticated = false;
    authService.currentUser = null;

    const result = guard.canActivate();

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to 403 if user role is not admin or superadmin', () => {
    authService.isAuthenticated = true;
    authService.currentUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      status: 'active',
    };

    const result = guard.canActivate();

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/403']);
  });

  it('should allow access for admin role', () => {
    authService.isAuthenticated = true;
    authService.currentUser = {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
    };

    const result = guard.canActivate();

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should allow access for superadmin role', () => {
    authService.isAuthenticated = true;
    authService.currentUser = {
      id: '1',
      name: 'Super Admin',
      email: 'superadmin@example.com',
      role: 'superadmin',
      status: 'active',
    };

    const result = guard.canActivate();

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
