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
} from '../../core/services/accounts.service';
import {
  TransactionsService,
  Transaction,
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
  recentTransactions: Transaction[] = [];
  isLoadingTransactions = false;
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
    this.loadBalance();
    this.loadRecentTransactions();
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

  getTransactionIcon(type: string): string {
    const icons: Record<string, string> = {
      deposit: 'pi pi-plus-circle',
      withdraw: 'pi pi-minus-circle',
      transfer: 'pi pi-arrow-right-arrow-left',
    };
    return icons[type] || 'pi pi-circle';
  }

  getTransactionColor(type: string): string {
    const colors: Record<string, string> = {
      deposit: 'text-brand-success',
      withdraw: 'text-brand-danger',
      transfer: 'text-brand-info',
    };
    return colors[type] || 'text-gray-400';
  }

  getTransactionTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      deposit: 'Nạp tiền',
      withdraw: 'Rút tiền',
      transfer: 'Chuyển khoản',
    };
    return labels[type] || type;
  }

  getAmountPrefix(type: string): string {
    return type === 'deposit' ? '+' : type === 'withdraw' ? '-' : '';
  }

  getAmountClass(type: string): string {
    const classes: Record<string, string> = {
      deposit: 'text-brand-success font-semibold',
      withdraw: 'text-brand-danger font-semibold',
      transfer: 'text-brand-info font-semibold',
    };
    return classes[type] || 'font-semibold';
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
}
