import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
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
  WithdrawRequest,
  WithdrawCheckResponse,
} from '../../../core/services/transactions.service';
import { AccountsService } from '../../../core/services/accounts.service';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';

@Component({
  selector: 'app-withdraw',
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
  templateUrl: './withdraw.component.html',
  styleUrl: './withdraw.component.scss',
})
export class WithdrawComponent implements OnInit, OnDestroy {
  withdrawForm: FormGroup;
  isLoading = false;
  isChecking = false;
  currentBalance: any = null;
  withdrawalCheck: WithdrawCheckResponse | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private transactionsService: TransactionsService,
    private accountsService: AccountsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
    this.withdrawForm = this.fb.group({
      amount: [
        null,
        [Validators.required, Validators.min(1000), Validators.max(100000000)],
      ],
      transName: [''],
    });
  }

  ngOnInit(): void {
    this.loadBalance();
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
    if (this.withdrawForm.valid) {
      const amount = this.withdrawForm.get('amount')?.value;
      const transName = this.withdrawForm.get('transName')?.value;

      // Check if sufficient balance
      if (this.currentBalance && amount > this.currentBalance.balance) {
        this.withdrawForm.get('amount')?.setErrors({ insufficient: true });
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Số dư không đủ để thực hiện giao dịch',
        });
        return;
      }

      this.confirmationService.confirm({
        message: `Bạn có chắc chắn muốn rút ${amount.toLocaleString('vi-VN')} ₫ từ tài khoản?`,
        header: 'Xác nhận rút tiền',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Xác nhận',
        rejectLabel: 'Hủy',
        accept: () => {
          this.processWithdrawal(amount, transName);
        },
      });
    } else {
      this.withdrawForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng điền đầy đủ thông tin',
      });
    }
  }

  private processWithdrawal(amount: number, transName: string): void {
    this.isLoading = true;

    const withdrawRequest: WithdrawRequest = {
      amount,
      transName: transName || `Rút tiền ${new Date().toLocaleString('vi-VN')}`,
      clientRequestId: uuidv4(),
    };

    this.transactionsService
      .withdraw(withdrawRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Rút tiền thành công!',
          });
          this.withdrawForm.reset();
          this.loadBalance(); // Reload balance
        },
        error: (error) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail:
              error.error?.message || 'Rút tiền thất bại. Vui lòng thử lại.',
          });
        },
      });
  }
}
