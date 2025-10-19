import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent implements OnInit {
  email = '';
  isLoading = false;
  isVerified = false;
  isResending = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParams['email'] || '';
    const code = this.route.snapshot.queryParams['code'];

    if (code) {
      this.verifyEmail(code);
    }
  }

  verifyEmail(code: string): void {
    this.isLoading = true;
    this.error = '';

    this.authService.verifyEmail(code).subscribe({
      next: () => {
        this.isLoading = false;
        this.isVerified = true;
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.message || 'Có lỗi xảy ra khi xác thực email';
      },
    });
  }

  resendVerification(): void {
    if (!this.email) return;

    this.isResending = true;
    this.authService.resendVerification(this.email).subscribe({
      next: () => {
        this.isResending = false;
        // Show success message
      },
      error: () => {
        this.isResending = false;
      },
    });
  }

  retryVerification(): void {
    const code = this.route.snapshot.queryParams['code'];
    if (code) {
      this.verifyEmail(code);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
