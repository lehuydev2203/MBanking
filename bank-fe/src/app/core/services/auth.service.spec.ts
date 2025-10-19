import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

describe('AuthService', () => {
  let service: AuthService;
  let apiService: jasmine.SpyObj<ApiService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['post']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully and store auth data', () => {
      const mockResponse = {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          status: 'active',
        },
      };

      apiService.post.and.returnValue(of(mockResponse));
      spyOn(service, 'setAuth' as any);
      spyOn(service, 'setupAutoLogout' as any);

      const loginData = { email: 'test@example.com', password: 'password123' };

      service.login(loginData).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(service['setAuth']).toHaveBeenCalledWith(mockResponse);
        expect(service['setupAutoLogout']).toHaveBeenCalled();
      });
    });

    it('should handle login error', () => {
      const error = { error: { message: 'INVALID_CREDENTIALS' } };
      apiService.post.and.returnValue(throwError(() => error));

      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      service.login(loginData).subscribe({
        next: () => fail('Should have failed'),
        error: (err) => {
          expect(err).toEqual(error);
        },
      });
    });
  });

  describe('token management', () => {
    it('should check if token is expired', () => {
      // Mock expired token
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ';

      spyOn(service, 'getToken').and.returnValue(expiredToken);

      expect(service.isTokenExpired()).toBe(true);
    });

    it('should return false for valid token', () => {
      // Mock valid token (future expiration)
      const validToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.valid-signature';

      spyOn(service, 'getToken').and.returnValue(validToken);

      expect(service.isTokenExpired()).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear auth data and navigate to login', () => {
      spyOn(service, 'clearAuth' as any);

      service.logout();

      expect(service['clearAuth']).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
