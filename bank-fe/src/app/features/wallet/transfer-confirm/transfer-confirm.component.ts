import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subject, takeUntil, interval } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import {
  TransactionsService,
  TransferConfirmRequest,
} from '../../../core/services/transactions.service';
import { AccountsService } from '../../../core/services/accounts.service';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';

interface TransferData {
  recipientIdentifier: string;
  amount: number;
  transName: string;
  expiresAt: string;
}

@Component({
  selector: 'app-transfer-confirm',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    CurrencyVndPipe,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './transfer-confirm.component.html',
  styleUrl: './transfer-confirm.component.scss',
})
export class TransferConfirmComponent implements OnInit, OnDestroy {
  confirmForm: FormGroup;
  isLoading = false;
  isResending = false;
  timeLeft = 0;
  transferData: TransferData | null = null;

  private destroy$ = new Subject<void>();
  private timer$ = interval(1000);

  constructor(
    private fb: FormBuilder,
    private transactionsService: TransactionsService,
    private accountsService: AccountsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.confirmForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
  }

  ngOnInit(): void {
    this.loadTransferData();
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTransferData(): void {
    this.route.queryParams.subscribe((params) => {
      if (
        params['recipient'] &&
        params['amount'] &&
        params['transName'] &&
        params['expiresAt']
      ) {
        this.transferData = {
          recipientIdentifier: params['recipient'],
          amount: parseFloat(params['amount']),
          transName: params['transName'],
          expiresAt: params['expiresAt'],
        };

        // Calculate initial time left
        const expiresAt = new Date(this.transferData.expiresAt);
        const now = new Date();
        this.timeLeft = Math.max(
          0,
          Math.floor((expiresAt.getTime() - now.getTime()) / 1000),
        );
      } else {
        // Redirect to transfer page if no data
        this.router.navigate(['/app/transfer']);
      }
    });
  }

  private startTimer(): void {
    this.timer$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      }
    });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  onSubmit(): void {
    if (this.confirmForm.valid && this.timeLeft > 0) {
      this.isLoading = true;

      const confirmRequest: TransferConfirmRequest = {
        code: this.confirmForm.value.code,
      };

      this.transactionsService
        .confirmTransfer(confirmRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Chuyển khoản hoàn tất thành công!',
              life: 5000,
            });

            // Refresh balance
            this.accountsService.refreshBalance();

            // Navigate to transactions page
            this.router.navigate(['/app/transactions']);
          },
          error: (error) => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi',
              detail:
                error.error?.message ||
                'Xác nhận chuyển khoản thất bại. Vui lòng thử lại.',
            });
          },
        });
    } else if (this.timeLeft <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Mã xác nhận đã hết hạn. Vui lòng thực hiện lại giao dịch.',
      });
    } else {
      this.confirmForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng nhập mã xác nhận hợp lệ',
      });
    }
  }

  resendCode(): void {
    if (!this.transferData) return;

    this.isResending = true;

    const transferRequest = {
      recipientIdentifier: this.transferData.recipientIdentifier,
      amount: this.transferData.amount,
      transName: this.transferData.transName,
    };

    this.transactionsService
      .initiateTransfer(transferRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isResending = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Mã xác nhận mới đã được gửi qua email.',
            life: 5000,
          });

          // Reset timer
          const expiresAt = new Date(response.expiresAt);
          const now = new Date();
          this.timeLeft = Math.max(
            0,
            Math.floor((expiresAt.getTime() - now.getTime()) / 1000),
          );

          // Clear form
          this.confirmForm.reset();
        },
        error: (error) => {
          this.isResending = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail:
              error.error?.message ||
              'Gửi lại mã xác nhận thất bại. Vui lòng thử lại.',
          });
        },
      });
  }

  cancelTransfer(): void {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn hủy giao dịch chuyển khoản này?',
      header: 'Xác nhận hủy',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hủy giao dịch',
      rejectLabel: 'Tiếp tục',
      accept: () => {
        this.router.navigate(['/app/transfer']);
      },
    });
  }
}
