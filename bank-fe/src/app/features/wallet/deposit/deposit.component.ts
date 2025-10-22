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
import { MessageService } from 'primeng/api';

import {
  TransactionsService,
  DepositRequest,
} from '../../../core/services/transactions.service';
import { AccountsService } from '../../../core/services/accounts.service';

@Component({
  selector: 'app-deposit',
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
  ],
  providers: [MessageService],
  templateUrl: './deposit.component.html',
  styleUrl: './deposit.component.scss',
})
export class DepositComponent implements OnInit, OnDestroy {
  depositForm: FormGroup;
  isLoading = false;
  currentBalance: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private transactionsService: TransactionsService,
    private accountsService: AccountsService,
    private messageService: MessageService,
  ) {
    this.depositForm = this.fb.group({
      amount: [
        null,
        [Validators.required, Validators.min(1000), Validators.max(100000000)],
      ],
      transName: [''],
    });
  }

  ngOnInit(): void {
    // Subscribe to balance updates
    this.accountsService.balance$
      .pipe(takeUntil(this.destroy$))
      .subscribe((balance) => {
        if (balance) {
          this.currentBalance = balance;
        }
      });

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
    if (this.depositForm.valid) {
      this.isLoading = true;

      const depositData: DepositRequest = {
        amount: this.depositForm.value.amount,
        transName: this.depositForm.value.transName || undefined,
        clientRequestId: uuidv4(), // Generate unique ID for idempotency
      };
      console.log(
        '🚀 ~ DepositComponent ~ onSubmit ~ depositData:',
        depositData,
      );

      this.transactionsService.deposit(depositData).subscribe({
        next: (transaction) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Nạp tiền thành công',
            detail: `Đã nạp ${transaction.transMoney.toLocaleString('vi-VN')} ₫ vào tài khoản`,
            life: 5000,
          });

          // Reset form
          this.depositForm.reset();

          // Refresh balance
          this.accountsService.refreshBalance();
        },
        error: () => {
          this.isLoading = false;
        },
      });
    }
  }
}
