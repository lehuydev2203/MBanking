import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
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
  isVerifying = false;
  error = '';
  otpDigits: string[] = ['', '', '', '', '', ''];

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

  onDigitInput(event: any, index: number): void {
    const value = event.target.value;

    // Only allow digits
    if (!/^\d$/.test(value) && value !== '') {
      event.target.value = '';
      this.otpDigits[index] = '';
      return;
    }

    this.otpDigits[index] = value;

    // Move to next input if current is filled
    if (value && index < 5) {
      const nextInput = document.querySelector(
        `input[data-index="${index + 1}"]`,
      ) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  onDigitKeydown(event: KeyboardEvent, index: number): void {
    const target = event.target as HTMLInputElement;

    // Handle backspace
    if (event.key === 'Backspace' && !target.value && index > 0) {
      const prevInput = document.querySelector(
        `input[data-index="${index - 1}"]`,
      ) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);

    // Fill the inputs with pasted digits
    for (let i = 0; i < digits.length && i < 6; i++) {
      this.otpDigits[i] = digits[i];
    }

    // Focus the next empty input or the last one
    const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
    const nextInput = document.querySelector(
      `input[data-index="${nextEmptyIndex}"]`,
    ) as HTMLInputElement;
    if (nextInput) {
      nextInput.focus();
    }
  }

  isOtpComplete(): boolean {
    return this.otpDigits.every((digit) => digit !== '');
  }

  verifyCode(): void {
    if (!this.isOtpComplete()) return;

    const code = this.otpDigits.join('');
    this.isVerifying = true;
    this.error = '';

    this.authService.verifyEmail(code).subscribe({
      next: () => {
        this.isVerifying = false;
        this.isVerified = true;
      },
      error: (error) => {
        this.isVerifying = false;
        this.error =
          error.error?.message || 'Mã xác thực không đúng hoặc đã hết hạn';

        // Clear OTP on error
        this.otpDigits = ['', '', '', '', '', ''];
        const firstInput = document.querySelector(
          `input[data-index="0"]`,
        ) as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
        }
      },
    });
  }
}
