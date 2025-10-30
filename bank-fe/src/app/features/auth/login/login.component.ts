import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { AuthService, LoginRequest } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = ''; // Clear previous error
      const loginData: LoginRequest = this.loginForm.value;

      this.authService.login(loginData).subscribe({
        next: (response) => {
          if (response) {
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Đăng nhập thành công!',
              life: 3000,
            });
            this.router.navigate(['/app/dashboard']);
          } else {
            this.errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('🚀 ~ LoginComponent ~ login error:', error);
          this.isLoading = false;

          // Handle EMAIL_NOT_VERIFIED error specially
          if (error.error && error.error.code === 'EMAIL_NOT_VERIFIED') {
            this.handleEmailNotVerified(loginData.email);
            return;
          }

          // Handle other error messages
          if (error.error && error.error.message) {
            this.errorMessage = this.mapErrorMessage(error.error.message);
          } else if (error.status) {
            this.errorMessage = this.mapHttpStatusError(error.status);
          } else {
            this.errorMessage = 'Đã xảy ra lỗi không xác định';
          }
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng điền đầy đủ thông tin đăng nhập',
        life: 3000,
      });
    }
  }

  private mapErrorMessage(message: string): string {
    const errorMap: Record<string, string> = {
      EMAIL_NOT_VERIFIED:
        'Email chưa được xác thực. Vui lòng kiểm tra hộp thư và xác thực email.',
      INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác.',
      USER_NOT_FOUND: 'Không tìm thấy người dùng.',
      USER_ALREADY_EXISTS: 'Người dùng đã tồn tại.',
      INVALID_TOKEN: 'Token không hợp lệ hoặc đã hết hạn.',
      INSUFFICIENT_BALANCE: 'Số dư không đủ để thực hiện giao dịch.',
      WITHDRAWAL_LIMIT_EXCEEDED: 'Vượt quá giới hạn rút tiền.',
      TRANSACTION_NOT_FOUND: 'Không tìm thấy giao dịch.',
      INVALID_AMOUNT: 'Số tiền không hợp lệ.',
      ACCOUNT_LOCKED: 'Tài khoản đã bị khóa.',
      VERIFICATION_CODE_INVALID: 'Mã xác thực không hợp lệ.',
      VERIFICATION_CODE_EXPIRED: 'Mã xác thực đã hết hạn.',
    };

    return errorMap[message] || message;
  }

  private mapHttpStatusError(status: number): string {
    const statusMap: Record<number, string> = {
      400: 'Yêu cầu không hợp lệ.',
      401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      403: 'Bạn không có quyền truy cập tài nguyên này.',
      404: 'Không tìm thấy tài nguyên.',
      409: 'Xung đột dữ liệu.',
      422: 'Dữ liệu không hợp lệ.',
      429: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
      500: 'Lỗi máy chủ. Vui lòng thử lại sau.',
      502: 'Lỗi kết nối máy chủ.',
      503: 'Dịch vụ tạm thời không khả dụng.',
    };

    return statusMap[status] || `Lỗi ${status}: Đã xảy ra lỗi không xác định.`;
  }

  private handleEmailNotVerified(email: string): void {
    // Show success message
    this.messageService.add({
      severity: 'info',
      summary: 'Email chưa được xác thực',
      detail: 'Đã gửi lại mã xác thực qua email. Vui lòng kiểm tra hộp thư.',
      life: 5000,
    });

    // Resend verification email
    this.authService.resendVerification(email).subscribe({
      next: () => {
        // Navigate to verify-email page with email parameter
        this.router.navigate(['/verify-email'], {
          queryParams: { email: email },
        });
      },
      error: (error) => {
        console.error('Failed to resend verification:', error);
        // Still navigate to verify-email page even if resend fails
        this.router.navigate(['/verify-email'], {
          queryParams: { email: email },
        });
      },
    });
  }
}
