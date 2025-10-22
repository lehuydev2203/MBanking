import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenuItem } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

import { AuthService } from '../../core/services/auth.service';
import {
  AccountsService,
  AccountBalance,
} from '../../core/services/accounts.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ButtonModule,
    MenubarModule,
    MenuModule,
    ConfirmDialogModule,
    ToastModule,
    ProgressSpinnerModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  balance: AccountBalance | null = null;
  isAdmin = false;
  userMenuItems: MenuItem[] = [];
  isBalanceVisible = true; // Toggle để ẩn/hiện số dư

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private accountsService: AccountsService,
    private confirmationService: ConfirmationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state
    this.authService.auth$.pipe(takeUntil(this.destroy$)).subscribe((auth) => {
      this.currentUser = auth?.user || null;
      this.isAdmin = ['admin', 'superadmin'].includes(
        this.currentUser?.role || '',
      );
      this.setupUserMenu();

      if (auth) {
        this.loadBalance();
      }
    });

    // Subscribe to balance updates
    this.accountsService.balance$
      .pipe(takeUntil(this.destroy$))
      .subscribe((balance) => {
        if (balance) {
          this.balance = balance;
        }
      });

    // Load initial data
    this.loadBalance();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupUserMenu(): void {
    this.userMenuItems = [
      {
        label: 'Hồ sơ cá nhân',
        icon: 'pi pi-user',
        command: () => this.router.navigate(['/app/profile']),
      },
      {
        label: 'Đổi mật khẩu',
        icon: 'pi pi-key',
        command: () =>
          this.router.navigate(['/app/profile'], {
            queryParams: { tab: 'password' },
          }),
      },
      {
        separator: true,
      },
      {
        label: 'Đăng xuất',
        icon: 'pi pi-sign-out',
        command: () => this.confirmLogout(),
      },
    ];
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
          this.balance = {
            balance: 0,
            currency: 'VND',
            lastUpdated: new Date().toISOString(),
          };
        },
      });
  }

  toggleBalanceVisibility(): void {
    this.isBalanceVisible = !this.isBalanceVisible;
  }

  getDisplayBalance(): string {
    if (!this.isBalanceVisible) {
      return '*.***.*** ₫';
    }
    const balance = this.balance?.balance ?? 0;
    return balance.toLocaleString('vi-VN') + ' ₫';
  }

  private confirmLogout(): void {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn đăng xuất?',
      header: 'Xác nhận đăng xuất',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Đăng xuất',
      rejectLabel: 'Hủy',
      accept: () => {
        this.authService.logout();
      },
    });
  }
}
