import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import {
  TransactionsService,
  TransactionData,
  TransactionFilters,
  TransactionType,
  getTransactionTypeLabel,
  getTransactionTypeIcon,
  getTransactionTypeColor,
  isIncomingTransaction,
  isOutgoingTransaction,
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
    CardModule,
    ProgressSpinnerModule,
    TagModule,
    ToastModule,
    CurrencyVndPipe,
  ],
  providers: [MessageService],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit, OnDestroy {
  filterForm: FormGroup;
  transactions: TransactionData[] = [];
  totalRecords = 0;
  pageSize = 10;
  currentPage = 1;
  totalPages = 0;
  isLoading = false;
  isExporting = false;
  sortField = 'createdAt';
  sortOrder = -1;

  // Make TransactionType available in template
  TransactionType = TransactionType;

  transactionTypes = [
    { label: 'Tất cả', value: null },
    { label: 'Nạp tiền', value: TransactionType.DEPOSIT },
    { label: 'Rút tiền', value: TransactionType.WITHDRAW },
    { label: 'Chuyển khoản', value: TransactionType.TRANSFER_SEND },
    { label: 'Nhận tiền', value: TransactionType.TRANSFER_RECEIVE },
  ];

  // Note: Status filter removed as API doesn't support it

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private transactionsService: TransactionsService,
    private messageService: MessageService,
  ) {
    this.filterForm = this.fb.group({
      type: [''], // Default to empty string to show "Tất cả"
      from: [null],
      to: [null],
      min: [null],
      max: [null],
    });

    // Add date validation
    this.filterForm.get('from')?.valueChanges.subscribe(() => {
      this.validateDateRange();
    });

    this.filterForm.get('to')?.valueChanges.subscribe(() => {
      this.validateDateRange();
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

    const formValue = this.filterForm.value;

    // Convert Date objects to ISO strings for API
    const filters: TransactionFilters = {
      page: event ? event.first / event.rows + 1 : this.currentPage,
      pageSize: event ? event.rows : this.pageSize,
      type: formValue.type,
      from: formValue.from ? new Date(formValue.from).toISOString() : undefined,
      to: formValue.to ? new Date(formValue.to).toISOString() : undefined,
      min: formValue.min,
      max: formValue.max,
    };

    this.transactionsService.list(filters).subscribe({
      next: (response) => {
        this.transactions = response.items as any[];
        this.totalRecords = response.total;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        this.sortTransactions(); // Apply sorting after loading data
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải danh sách giao dịch',
          life: 3000,
        });
      },
    });
  }

  applyFilters(): void {
    // Validate date range before applying filters
    if (this.validateDateRangeBeforeSubmit()) {
      this.loadTransactions();
    }
  }

  private validateDateRangeBeforeSubmit(): boolean {
    const fromDate = this.filterForm.get('from')?.value;
    const toDate = this.filterForm.get('to')?.value;

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (from > to) {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail:
            'Ngày bắt đầu không được lớn hơn ngày kết thúc. Vui lòng chọn lại.',
          life: 5000,
        });
        return false;
      }
    }

    return true;
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.loadTransactions();
  }

  exportCsv(): void {
    this.isExporting = true;
    const formValue = this.filterForm.value;

    // Convert Date objects to ISO strings for API
    const filters: TransactionFilters = {
      type: formValue.type,
      from: formValue.from ? new Date(formValue.from).toISOString() : undefined,
      to: formValue.to ? new Date(formValue.to).toISOString() : undefined,
      min: formValue.min,
      max: formValue.max,
    };

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
      error: (error) => {
        console.error('Error exporting CSV:', error);
        this.isExporting = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể xuất file CSV',
          life: 3000,
        });
      },
    });
  }

  getTransactionIcon(type: number): string {
    return getTransactionTypeIcon(type);
  }

  getTransactionColor(type: number): string {
    return getTransactionTypeColor(type);
  }

  getTransactionTypeLabel(type: number): string {
    return getTransactionTypeLabel(type);
  }

  getAmountPrefix(type: number): string {
    return isIncomingTransaction(type)
      ? '+'
      : isOutgoingTransaction(type)
        ? '-'
        : '';
  }

  getAmountClass(type: number): string {
    const color = getTransactionTypeColor(type);
    return `${color} font-semibold`;
  }

  // Note: Status-related functions removed as API doesn't support status filtering

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 1 ? -1 : 1;
    } else {
      this.sortField = field;
      this.sortOrder = 1;
    }
    this.sortTransactions();
  }

  private sortTransactions(): void {
    if (!this.transactions || this.transactions.length === 0) return;

    this.transactions.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortField) {
        case 'type':
          aValue = a.transType;
          bValue = b.transType;
          break;
        case 'amount':
          aValue = a.transMoney;
          bValue = b.transMoney;
          break;
        case 'status':
          aValue = 'completed'; // All transactions are completed for now
          bValue = 'completed';
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      if (aValue < bValue) return this.sortOrder;
      if (aValue > bValue) return -this.sortOrder;
      return 0;
    });
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

  // Generate description based on transaction type and time
  getTransactionDescription(transaction: any): string {
    const transactionType = transaction.transType;
    const createdAt = new Date(transaction.createdAt);

    // Format time as HH:MM:SS
    const timeStr = createdAt.toLocaleTimeString('vi-VN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Format date as DD/MM/YYYY
    const dateStr = createdAt.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    switch (transactionType) {
      case TransactionType.DEPOSIT:
        return `Nạp tiền ${timeStr} ${dateStr}`;
      case TransactionType.WITHDRAW:
        return `Rút tiền ${timeStr} ${dateStr}`;
      case TransactionType.TRANSFER_SEND:
        return `Chuyển khoản ${timeStr} ${dateStr}`;
      case TransactionType.TRANSFER_RECEIVE:
        return `Nhận tiền ${timeStr} ${dateStr}`;
      default:
        return `Giao dịch ${timeStr} ${dateStr}`;
    }
  }

  // Method to trigger date picker when clicking on date input
  openDatePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.type === 'date') {
      input.showPicker();
    }
  }

  // Validate date range
  private validateDateRange(): void {
    const fromDate = this.filterForm.get('from')?.value;
    const toDate = this.filterForm.get('to')?.value;

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (from > to) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Cảnh báo',
          detail: 'Ngày bắt đầu không được lớn hơn ngày kết thúc',
          life: 3000,
        });

        // Clear the invalid date
        this.filterForm.get('from')?.setValue(null);
      }
    }
  }
}
