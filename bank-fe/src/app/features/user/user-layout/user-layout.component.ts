import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { AccountsService } from '../../../core/services/accounts.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
}

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss',
})
export class UserLayoutComponent implements OnInit, OnDestroy {
  user: UserProfile | null = null;
  balance: number = 0;
  isMenuOpen = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private accountsService: AccountsService,
    private confirmationService: ConfirmationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserData(): void {
    // Get user from auth service
    const currentUser = this.authService.currentUser;
    console.log('🔍 Current user from authService:', currentUser);
    if (currentUser) {
      this.user = currentUser;
      console.log('✅ User loaded:', this.user);
    }

    // Subscribe to auth changes
    this.authService.auth$.pipe(takeUntil(this.destroy$)).subscribe((auth) => {
      console.log('🔍 Auth stream updated:', auth);
      if (auth?.user) {
        this.user = auth.user;
        console.log('✅ User updated from auth$:', this.user);
      }
    });

    this.accountsService.getBalance().subscribe({
      next: (response: { balance: number }) => {
        this.balance = response.balance;
      },
      error: (error: any) => {
        console.error('Error loading balance:', error);
      },
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn đăng xuất?',
      header: 'Xác nhận đăng xuất',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Đăng xuất',
      rejectLabel: 'Hủy',
      accept: () => {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
