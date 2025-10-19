import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import {
  TransactionsService,
  TransferRequest,
} from '../../../core/services/transactions.service';
import { AccountsService } from '../../../core/services/accounts.service';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    MessageModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    CurrencyVndPipe,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.scss',
})
export class TransferComponent implements OnInit, OnDestroy {
  transferForm: FormGroup;
  isLoading = false;
  currentBalance: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private transactionsService: TransactionsService,
    private accountsService: AccountsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
  ) {
    this.transferForm = this.fb.group({
      recipient: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(\d{10}|[a-zA-Z0-9_]{3,20})$/),
        ],
      ],
      amount: [
        null,
        [Validators.required, Validators.min(1000), Validators.max(100000000)],
      ],
      transName: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  ngOnInit(): void {
    this.loadCurrentBalance();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentBalance(): void {
    this.accountsService
      .getBalance()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (balance) => {
          this.currentBalance = balance;
        },
        error: () => {
          // Set default balance when API fails
          this.currentBalance = {
            balance: 0,
            currency: 'VND',
            lastUpdated: new Date().toISOString(),
          };
        },
      });
  }

  onSubmit(): void {
    if (this.transferForm.valid) {
      const amount = this.transferForm.get('amount')?.value;
      const recipient = this.transferForm.get('recipient')?.value;
      const transName = this.transferForm.get('transName')?.value;

      // Check if sufficient balance
      if (this.currentBalance && amount > this.currentBalance.balance) {
        this.transferForm.get('amount')?.setErrors({ insufficient: true });
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Số dư không đủ để thực hiện giao dịch',
        });
        return;
      }

      this.confirmationService.confirm({
        message: `Bạn có chắc chắn muốn chuyển ${amount.toLocaleString('vi-VN')} ₫ đến tài khoản ${recipient}?`,
        header: 'Xác nhận chuyển khoản',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Xác nhận',
        rejectLabel: 'Hủy',
        accept: () => {
          this.processTransfer(recipient, amount, transName);
        },
      });
    } else {
      this.transferForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng điền đầy đủ thông tin',
      });
    }
  }

  private processTransfer(
    recipient: string,
    amount: number,
    transName: string,
  ): void {
    this.isLoading = true;

    const transferRequest: TransferRequest = {
      recipientIdentifier: recipient,
      amount,
      transName,
    };

    this.transactionsService
      .initiateTransfer(transferRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail:
              'Mã xác nhận đã được gửi qua email. Vui lòng kiểm tra hộp thư.',
            life: 5000,
          });

          // Navigate to confirm page with transfer data
          this.router.navigate(['/app/transfer/confirm'], {
            queryParams: {
              recipient,
              amount,
              transName,
              expiresAt: response.expiresAt,
            },
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail:
              error.error?.message ||
              'Khởi tạo chuyển khoản thất bại. Vui lòng thử lại.',
          });
        },
      });
  }
}
