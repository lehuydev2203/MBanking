import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const messageService = inject(MessageService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Đã xảy ra lỗi không xác định';
      let severity: 'success' | 'info' | 'warn' | 'error' = 'error';

      if (error.error && error.error.message) {
        errorMessage = mapErrorMessage(error.error.message);
      } else if (error.status) {
        errorMessage = mapHttpStatusError(error.status);
      }

      // Handle specific error codes
      if (error.status === 401) {
        authService.logout();
        return throwError(() => error);
      }

      if (error.status === 403) {
        // Check if it's EMAIL_NOT_VERIFIED error - don't show toast, let component handle it
        if (error.error && error.error.code === 'EMAIL_NOT_VERIFIED') {
          // Don't show toast for EMAIL_NOT_VERIFIED, let the login component handle the error
          return throwError(() => error);
        }

        // For other 403 errors, redirect to 403 page
        router.navigate(['/403']);
        return throwError(() => error);
      }

      // Show toast message
      messageService.add({
        severity,
        summary: 'Thông báo',
        detail: errorMessage,
        life: 5000,
      });

      return throwError(() => error);
    }),
  );
};

function mapErrorMessage(message: string): string {
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

function mapHttpStatusError(status: number): string {
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
