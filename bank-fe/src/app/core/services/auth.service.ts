import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, timer, switchMap, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
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
  private readonly TOKEN_TIMESTAMP_KEY = 'auth.token.timestamp';
  private readonly TOKEN_EXPIRY_MINUTES = 15; // 15 phút

  private authSubject = new BehaviorSubject<{
    token: string;
    user: any;
    expiresIn?: number;
  } | null>(null);
  private logoutTimer: any;

  constructor(
    private apiService: ApiService,
    private router: Router,
  ) {
    // Clear any old localStorage data to avoid conflicts
    this.clearOldLocalStorageData();
    // Initialize auth state safely after constructor
    this.initializeAuthState();
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
    const hasToken = !!this.getToken();
    const notExpired = !this.isTokenExpired();
    const result = hasToken && notExpired;

    console.log(
      '🔐 AuthService: isAuthenticated check - hasToken:',
      hasToken,
      'notExpired:',
      notExpired,
      'result:',
      result,
    );

    return result;
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

  login(body: LoginRequest): Observable<AuthResponse | null> {
    return this.apiService
      .post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, body)
      .pipe(
        switchMap((authData) => {
          console.log('🔐 AuthService: Login response:', authData);

          if (authData) {
            console.log('🔐 AuthService: User data from API:', authData.user);

            // If API doesn't return user data, get from profile API
            if (!authData.user && authData.accessToken) {
              console.log('🔐 AuthService: Getting user profile from API...');
              return this.apiService.get<any>(API_ENDPOINTS.PROFILE.GET).pipe(
                map((profileData) => {
                  const userData = {
                    id: profileData.id,
                    name: profileData.name,
                    email: profileData.email,
                    role: profileData.role || 'user',
                    status: profileData.status || 'active',
                    phone: profileData.phone,
                  };
                  console.log(
                    '🔐 AuthService: User data from profile API:',
                    userData,
                  );

                  this.setAuth({
                    token: authData.accessToken,
                    user: userData,
                    expiresIn: authData.expiresIn,
                  });
                  this.setupAutoLogout();

                  return authData;
                }),
                catchError((error) => {
                  console.error(
                    '🔐 AuthService: Failed to get profile:',
                    error,
                  );
                  // Fallback to token decode
                  try {
                    const decodedToken = this.decodeToken(authData.accessToken);
                    const userData = {
                      id: decodedToken.sub,
                      name: decodedToken.name || decodedToken.email || 'User',
                      email: decodedToken.email,
                      role: decodedToken.role,
                      status: decodedToken.status || 'active',
                      phone: decodedToken.phone || undefined,
                    };
                    console.log(
                      '🔐 AuthService: User data decoded from token:',
                      userData,
                    );

                    this.setAuth({
                      token: authData.accessToken,
                      user: userData,
                      expiresIn: authData.expiresIn,
                    });
                    this.setupAutoLogout();
                  } catch (decodeError) {
                    console.error(
                      '🔐 AuthService: Failed to decode token:',
                      decodeError,
                    );
                  }

                  return of(authData);
                }),
              );
            } else {
              // API returned user data
              this.setAuth({
                token: authData.accessToken,
                user: authData.user,
                expiresIn: authData.expiresIn,
              });
              this.setupAutoLogout();
              return of(authData);
            }
          }

          return of(authData);
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
    localStorage.setItem(this.TOKEN_TIMESTAMP_KEY, Date.now().toString());
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_TIMESTAMP_KEY);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    const timestampStr = localStorage.getItem(this.TOKEN_TIMESTAMP_KEY);
    if (!timestampStr) {
      return true;
    }

    const tokenTimestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    const expiryTime = tokenTimestamp + this.TOKEN_EXPIRY_MINUTES * 60 * 1000;

    const isExpired = now > expiryTime;

    if (isExpired) {
      console.log('🔐 Token expired based on timestamp');
    }

    return isExpired;
  }

  getTokenExpirationLeft(): number {
    const token = this.getToken();
    if (!token) return 0;

    const timestampStr = localStorage.getItem(this.TOKEN_TIMESTAMP_KEY);
    if (!timestampStr) return 0;

    const tokenTimestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    const expiryTime = tokenTimestamp + this.TOKEN_EXPIRY_MINUTES * 60 * 1000;

    return Math.max(0, expiryTime - now);
  }

  // Private methods
  private setAuth(auth: {
    token: string;
    user: any;
    expiresIn?: number;
  }): void {
    console.log('🔐 AuthService: setAuth called with:', auth);
    console.log('🔐 AuthService: User to save:', auth.user);

    this.setToken(auth.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(auth.user));
    this.authSubject.next(auth);

    console.log(
      '🔐 AuthService: User saved to localStorage:',
      localStorage.getItem(this.USER_KEY),
    );
  }

  private initializeAuthState(): void {
    console.log('🔐 AuthService: Initializing auth state...');
    const storedAuth = this.getStoredAuth();
    console.log('🔐 AuthService: Stored auth found:', !!storedAuth);

    if (storedAuth) {
      console.log(
        '🔐 AuthService: Setting auth state with user:',
        storedAuth.user?.email,
      );
      this.authSubject.next(storedAuth);
    } else {
      console.log('🔐 AuthService: No valid stored auth found');
    }
  }

  private getStoredAuth(): {
    token: string;
    user: any;
    expiresIn?: number;
  } | null {
    console.log('🔐 AuthService: Getting stored auth...');
    const token = this.getToken();
    const userStr = localStorage.getItem(this.USER_KEY);

    console.log('🔐 AuthService: Token exists:', !!token);
    console.log('🔐 AuthService: User data exists:', !!userStr);

    if (!token || !userStr) {
      console.log('🔐 AuthService: Missing token or user data');
      return null;
    }

    // Check token expiration using simple timestamp
    const isExpired = this.isTokenExpired();
    console.log('🔐 AuthService: Token expired:', isExpired);

    if (isExpired) {
      console.log('🔐 AuthService: Token expired, clearing auth');
      this.clearAuth();
      return null;
    }

    try {
      // Check if userStr is valid JSON
      if (userStr === 'undefined' || userStr === 'null' || userStr === '') {
        console.log('🔐 AuthService: Invalid user data (undefined/null/empty)');
        this.clearAuth();
        return null;
      }

      const user = JSON.parse(userStr);
      console.log('🔐 AuthService: Successfully parsed user data');
      return { token, user };
    } catch (error) {
      console.log('🔐 AuthService: Failed to parse user data:', error);
      this.clearAuth();
      return null;
    }
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('🔐 AuthService: Error decoding token:', error);
      return null;
    }
  }

  private clearOldLocalStorageData(): void {
    // Only clear if we have corrupted data
    const userStr = localStorage.getItem(this.USER_KEY);

    // If we have corrupted user data, clear everything
    if (userStr === 'undefined' || userStr === 'null' || userStr === '') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.TOKEN_TIMESTAMP_KEY);
      console.log('🔐 AuthService: Cleared corrupted localStorage data');
    } else if (userStr) {
      // Try to parse user data to check if it's valid JSON
      try {
        JSON.parse(userStr);
        console.log('🔐 AuthService: localStorage data looks good');
      } catch {
        // Invalid JSON, clear everything
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.TOKEN_TIMESTAMP_KEY);
        console.log('🔐 AuthService: Cleared invalid JSON localStorage data');
      }
    } else {
      console.log('🔐 AuthService: No localStorage data found');
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

    // Wait a bit for auth state to be initialized
    setTimeout(() => {
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
    }, 100); // Small delay to ensure auth state is initialized
  }

  private clearLogoutTimer(): void {
    if (this.logoutTimer) {
      this.logoutTimer.unsubscribe();
      this.logoutTimer = null;
    }
  }
}
