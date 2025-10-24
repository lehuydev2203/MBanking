import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    status: string;
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth.token';
  private readonly USER_KEY = 'auth.user';

  private authSubject = new BehaviorSubject<{
    token: string;
    user: any;
    expiresIn?: number;
  } | null>(this.getStoredAuth());
  private logoutTimer: any;

  constructor(
    private apiService: ApiService,
    private router: Router,
  ) {
    this.setupAutoLogout();
  }

  get auth$(): Observable<{
    token: string;
    user: any;
    expiresIn?: number;
  } | null> {
    return this.authSubject.asObservable();
  }

  get isAuthenticated(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  get currentUser() {
    return this.authSubject.value?.user || null;
  }

  get currentToken(): string | null {
    return this.getToken();
  }

  register(body: RegisterRequest): Observable<any> {
    return this.apiService.post(API_ENDPOINTS.AUTH.REGISTER, body);
  }

  verifyEmail(code: string): Observable<any> {
    return this.apiService.post(API_ENDPOINTS.AUTH.VERIFY, { code });
  }

  resendVerification(email: string): Observable<any> {
    return this.apiService.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, {
      email,
    });
  }

  login(body: LoginRequest): Observable<AuthResponse> {
    return this.apiService
      .post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, body)
      .pipe(
        tap((authData) => {
          if (authData) {
            this.setAuth({
              token: authData.accessToken,
              user: authData.user,
              expiresIn: authData.expiresIn,
            });
            this.setupAutoLogout();
          }
        }),
      );
  }

  changePassword(body: ChangePasswordRequest): Observable<any> {
    return this.apiService.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, body);
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    // Kiểm tra format token
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return true;
    }

    // Kiểm tra thời gian hết hạn thực tế
    try {
      const decoded = this.decodeToken(token);
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp <= now;
    } catch {
      return true;
    }
  }

  getTokenExpirationLeft(): number {
    const token = this.getToken();
    if (!token) return 0;

    try {
      const decoded = this.decodeToken(token);
      return Math.max(0, decoded.exp * 1000 - Date.now());
    } catch {
      return 0;
    }
  }

  decodeToken(token: string): JwtPayload {
    return jwtDecode<JwtPayload>(token);
  }

  // Private methods
  private setAuth(auth: {
    token: string;
    user: any;
    expiresIn?: number;
  }): void {
    this.setToken(auth.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(auth.user));
    this.authSubject.next(auth);
  }

  private getStoredAuth(): {
    token: string;
    user: any;
    expiresIn?: number;
  } | null {
    const token = this.getToken();
    const userStr = localStorage.getItem(this.USER_KEY);

    if (!token || !userStr || this.isTokenExpired()) {
      this.clearAuth();
      return null;
    }

    try {
      const user = JSON.parse(userStr);
      return { token, user };
    } catch {
      this.clearAuth();
      return null;
    }
  }

  private clearAuth(): void {
    this.removeToken();
    localStorage.removeItem(this.USER_KEY);
    if (this.authSubject) {
      this.authSubject.next(null);
    }
    this.clearLogoutTimer();
  }

  private setupAutoLogout(): void {
    this.clearLogoutTimer();

    if (!this.isAuthenticated) return;

    const expLeft = this.getTokenExpirationLeft();
    if (expLeft <= 0) {
      this.logout();
      return;
    }

    // Set up a single timer that checks every 30 seconds
    this.logoutTimer = timer(30000, 30000).subscribe(() => {
      const currentExpLeft = this.getTokenExpirationLeft();

      if (currentExpLeft <= 0) {
        this.logout();
      } else if (currentExpLeft <= 60000) {
        console.warn(
          `Token will expire in ${Math.floor(currentExpLeft / 1000)} seconds`,
        );
      }
    });
  }

  private clearLogoutTimer(): void {
    if (this.logoutTimer) {
      this.logoutTimer.unsubscribe();
      this.logoutTimer = null;
    }
  }
}
