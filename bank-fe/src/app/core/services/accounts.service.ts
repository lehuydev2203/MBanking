import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'superadmin';
  status: 'active' | 'locked';
  isEmailVerified: boolean;
  createdAt: string;
  verifiedAt?: string;
  // Computed fields
  accountNumber?: string;
  nickname?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  nickname?: string;
}

export interface AccountBalance {
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface RecipientInfo {
  identifier: string;
  name: string;
  accountNumber: string;
  nickname?: string;
  isVerified: boolean;
  isActive: boolean;
}

// RecipientInfoResponse is now just RecipientInfo since ApiService handles the wrapper
export type RecipientInfoResponse = RecipientInfo;

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  private balanceSubject = new BehaviorSubject<AccountBalance | null>(null);
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);

  constructor(private apiService: ApiService) {}

  get balance$(): Observable<AccountBalance | null> {
    return this.balanceSubject.asObservable();
  }

  get profile$(): Observable<UserProfile | null> {
    return this.profileSubject.asObservable();
  }

  getProfile(): Observable<UserProfile> {
    return this.apiService.get<any>(API_ENDPOINTS.PROFILE.GET).pipe(
      map((profileData: any) => {
        console.log('🔍 Profile Data:', profileData);

        // Map API response to UserProfile interface
        const profile: UserProfile = {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          role: profileData.role || 'user',
          status: profileData.status,
          isEmailVerified: profileData.isEmailVerified || false,
          createdAt: profileData.createdAt || new Date().toISOString(),
          verifiedAt: profileData.verifiedAt,
          // Use account number from API or generate from ID
          accountNumber:
            profileData.accountNumber ||
            this.generateAccountNumber(profileData.id),
          // Use nickname from API or fallback to name
          nickname: profileData.nickname || profileData.name,
        };

        console.log('🔍 Mapped Profile:', profile);
        return profile;
      }),
      tap((profile) => {
        this.profileSubject.next(profile);
      }),
    );
  }

  private generateAccountNumber(id: string): string {
    // Generate account number from user ID (last 8 digits)
    const numericId = id.replace(/\D/g, '');
    const last8Digits = numericId.slice(-8);
    return last8Digits.padStart(8, '0');
  }

  updateProfile(body: UpdateProfileRequest): Observable<UserProfile> {
    return this.apiService
      .patch<UserProfile>(API_ENDPOINTS.PROFILE.UPDATE, body)
      .pipe(tap((profile) => this.profileSubject.next(profile)));
  }

  getBalance(): Observable<AccountBalance> {
    return this.apiService
      .get<AccountBalance>(API_ENDPOINTS.BALANCE.GET)
      .pipe(tap((balance) => this.balanceSubject.next(balance)));
  }

  refreshBalance(): void {
    this.getBalance().subscribe();
  }

  refreshProfile(): void {
    this.getProfile().subscribe();
  }

  setNickname(nickname: string): Observable<any> {
    return this.apiService.post(API_ENDPOINTS.PROFILE.SET_NICKNAME, {
      nickname,
    });
  }

  getRecipientInfo(identifier: string): Observable<RecipientInfoResponse> {
    return this.apiService.get<RecipientInfoResponse>(
      `${API_ENDPOINTS.PROFILE.GET}/recipient?identifier=${encodeURIComponent(identifier)}`,
    );
  }
}
