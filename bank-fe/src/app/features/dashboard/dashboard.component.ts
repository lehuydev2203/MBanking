import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';

import {
  AccountsService,
  AccountBalance,
  UserProfile,
} from '../../core/services/accounts.service';
import {
  TransactionsService,
  TransactionData,
  TransactionType,
  getTransactionTypeLabel,
  getTransactionTypeIcon,
  getTransactionTypeColor,
  isIncomingTransaction,
  isOutgoingTransaction,
} from '../../core/services/transactions.service';
import { CurrencyVndPipe } from '../../shared/pipes/currency-vnd.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    TableModule,
    ProgressSpinnerModule,
    TagModule,
    CurrencyVndPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  balance: AccountBalance | null = null;
  recentTransactions: TransactionData[] = [];
  isLoadingTransactions = false;
  currentProfile: UserProfile | null = null;
  isLoadingProfile = false;
  currentDate = new Date();

  // Default values when API fails
  defaultBalance = {
    balance: 0,
    currency: 'VND',
    lastUpdated: new Date().toISOString(),
  };

  // Helper method for template
  getDefaultDate(): Date {
    return new Date();
  }

  private destroy$ = new Subject<void>();

  constructor(
    private accountsService: AccountsService,
    private transactionsService: TransactionsService,
  ) {}

  ngOnInit(): void {
    // Subscribe to balance updates
    this.accountsService.balance$
      .pipe(takeUntil(this.destroy$))
      .subscribe((balance) => {
        if (balance) {
          this.balance = balance;
        }
      });

    this.loadBalance();
    this.loadRecentTransactions();
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBalance(): void {
    this.accountsService
      .getBalance()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (balance) => {
          this.balance = balance;
        },
        error: () => {
          // Set default balance when API fails
          this.balance = this.defaultBalance;
        },
      });
  }

  private loadProfile(): void {
    this.isLoadingProfile = true;
    this.accountsService
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.currentProfile = profile;
          this.isLoadingProfile = false;
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.isLoadingProfile = false;
          // Set default profile when API fails
          this.currentProfile = {
            id: 'unknown',
            name: 'Người dùng',
            email: 'user@example.com',
            role: 'user',
            status: 'active',
            isEmailVerified: false,
            createdAt: new Date().toISOString(),
            accountNumber: '00000000',
            nickname: 'Người dùng',
          };
        },
      });
  }

  private loadRecentTransactions(): void {
    this.isLoadingTransactions = true;
    this.transactionsService
      .list({ page: 1, pageSize: 5 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.recentTransactions = response.items as any[];
          this.isLoadingTransactions = false;
        },
        error: () => {
          // Set empty array when API fails
          this.recentTransactions = [];
          this.isLoadingTransactions = false;
        },
      });
  }

  refreshBalance(): void {
    this.accountsService.refreshBalance();
  }

  refreshProfile(): void {
    this.accountsService.refreshProfile();
  }

  getTransactionIcon(type: number): string {
    return getTransactionTypeIcon(type);
  }

  getTransactionColor(type: number): string {
    return getTransactionTypeColor(type);
  }

  getTransactionTypeLabel(type: number): string {
    return getTransactionTypeLabel(type);
  }

  getAmountPrefix(type: number): string {
    return isIncomingTransaction(type)
      ? '+'
      : isOutgoingTransaction(type)
        ? '-'
        : '';
  }

  getAmountClass(type: number): string {
    const color = getTransactionTypeColor(type);
    return `${color} font-semibold`;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Đang xử lý',
      completed: 'Hoàn thành',
      failed: 'Thất bại',
      cancelled: 'Đã hủy',
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
      pending: 'warn',
      completed: 'success',
      failed: 'danger',
      cancelled: 'info',
    };
    return severities[status] || 'info';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'status-badge pending',
      completed: 'status-badge success',
      failed: 'status-badge error',
      cancelled: 'status-badge cancelled',
    };
    return classes[status] || 'status-badge';
  }

  getAccountTypeLabel(role?: string): string {
    const labels: Record<string, string> = {
      user: 'Cá nhân',
      admin: 'Quản trị viên',
      superadmin: 'Siêu quản trị viên',
    };
    return labels[role || 'user'] || 'Cá nhân';
  }
}
