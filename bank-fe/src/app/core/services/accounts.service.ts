import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  nickname?: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
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
    return this.apiService
      .get<UserProfile>('/accounts/profile')
      .pipe(tap((profile) => this.profileSubject.next(profile)));
  }

  updateProfile(body: UpdateProfileRequest): Observable<UserProfile> {
    return this.apiService
      .put<UserProfile>('/accounts/profile', body)
      .pipe(tap((profile) => this.profileSubject.next(profile)));
  }

  getBalance(): Observable<AccountBalance> {
    return this.apiService
      .get<AccountBalance>('/accounts/balance')
      .pipe(tap((balance) => this.balanceSubject.next(balance)));
  }

  refreshBalance(): void {
    this.getBalance().subscribe();
  }

  refreshProfile(): void {
    this.getProfile().subscribe();
  }
}
