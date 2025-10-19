import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

import {
  TransactionsService,
  Transaction,
  TransactionFilters,
} from '../../core/services/transactions.service';
import { CurrencyVndPipe } from '../../shared/pipes/currency-vnd.pipe';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    CardModule,
    ProgressSpinnerModule,
    TagModule,
    CurrencyVndPipe,
  ],
  providers: [MessageService],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit, OnDestroy {
  filterForm: FormGroup;
  transactions: Transaction[] = [];
  totalRecords = 0;
  pageSize = 10;
  currentPage = 1;
  totalPages = 0;
  isLoading = false;
  isExporting = false;
  sortField = 'createdAt';
  sortOrder = -1;

  transactionTypes = [
    { label: 'Tất cả', value: null },
    { label: 'Nạp tiền', value: 'deposit' },
    { label: 'Rút tiền', value: 'withdraw' },
    { label: 'Chuyển khoản', value: 'transfer' },
  ];

  statusOptions = [
    { label: 'Tất cả', value: null },
    { label: 'Đang xử lý', value: 'pending' },
    { label: 'Hoàn thành', value: 'completed' },
    { label: 'Thất bại', value: 'failed' },
    { label: 'Đã hủy', value: 'cancelled' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private transactionsService: TransactionsService,
    private messageService: MessageService,
  ) {
    this.filterForm = this.fb.group({
      type: [null],
      status: [null],
      from: [null],
      to: [null],
      min: [null],
      max: [null],
    });
  }

  ngOnInit(): void {
    this.loadTransactions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTransactions(event?: any): void {
    this.isLoading = true;

    const filters: TransactionFilters = {
      page: event ? event.first / event.rows + 1 : this.currentPage,
      pageSize: event ? event.rows : this.pageSize,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      ...this.filterForm.value,
    };

    this.transactionsService.list(filters).subscribe({
      next: (response) => {
        this.transactions = response.items as any[];
        this.totalRecords = response.total;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    this.loadTransactions();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.loadTransactions();
  }

  exportCsv(): void {
    this.isExporting = true;
    const filters = this.filterForm.value;

    this.transactionsService.exportCsv(filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.isExporting = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Xuất file thành công',
          detail: 'File CSV đã được tải xuống',
          life: 3000,
        });
      },
      error: () => {
        this.isExporting = false;
      },
    });
  }

  getTransactionIcon(type: string): string {
    const icons: Record<string, string> = {
      deposit: 'pi pi-plus-circle',
      withdraw: 'pi pi-minus-circle',
      transfer: 'pi pi-arrow-right-arrow-left',
    };
    return icons[type] || 'pi pi-circle';
  }

  getTransactionColor(type: string): string {
    const colors: Record<string, string> = {
      deposit: 'text-brand-success',
      withdraw: 'text-brand-danger',
      transfer: 'text-brand-info',
    };
    return colors[type] || 'text-gray-400';
  }

  getTransactionTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      deposit: 'Nạp tiền',
      withdraw: 'Rút tiền',
      transfer: 'Chuyển khoản',
    };
    return labels[type] || type;
  }

  getAmountPrefix(type: string): string {
    return type === 'deposit' ? '+' : type === 'withdraw' ? '-' : '';
  }

  getAmountClass(type: string): string {
    const classes: Record<string, string> = {
      deposit: 'text-brand-success font-semibold',
      withdraw: 'text-brand-danger font-semibold',
      transfer: 'text-brand-info font-semibold',
    };
    return classes[type] || 'font-semibold';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Đang xử lý',
      completed: 'Hoàn thành',
      failed: 'Thất bại',
      cancelled: 'Đã hủy',
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
      pending: 'warn',
      completed: 'success',
      failed: 'danger',
      cancelled: 'info',
    };
    return severities[status] || 'info';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'status-pending',
      completed: 'status-completed',
      failed: 'status-failed',
      cancelled: 'status-cancelled',
    };
    return classes[status] || 'status-default';
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 1 ? -1 : 1;
    } else {
      this.sortField = field;
      this.sortOrder = 1;
    }
    this.loadTransactions();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTransactions();
    }
  }

  get Math() {
    return Math;
  }
}
