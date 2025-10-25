import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AdminService } from '../../../core/services/admin.service';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProgressSpinnerModule,
    CurrencyVndPipe,
  ],
  templateUrl: './admin-transactions.component.html',
  styleUrl: './admin-transactions.component.scss',
})
export class AdminTransactionsComponent implements OnInit {
  filterForm: FormGroup;
  transactions: any[] = [];
  totalRecords = 0;
  pageSize = 20;
  currentPage = 1;
  totalPages = 0;
  isLoading = false;
  Math = Math; // Make Math available in template

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
  ) {
    this.filterForm = this.fb.group({
      type: [''],
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

  loadTransactions(): void {
    this.isLoading = true;
    const filters: any = {
      page: this.currentPage,
      pageSize: this.pageSize,
    };

    const formValue = this.filterForm.value;
    if (formValue.type) filters.type = formValue.type;
    if (formValue.from) filters.from = new Date(formValue.from).toISOString();
    if (formValue.to) filters.to = new Date(formValue.to).toISOString();
    if (formValue.min) filters.min = formValue.min;
    if (formValue.max) filters.max = formValue.max;

    this.adminService
      .getTransactions(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.transactions = response.data?.items || [];
          this.totalRecords = response.data?.total || 0;
          this.totalPages = response.data?.totalPages || 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading transactions:', error);
          this.isLoading = false;
        },
      });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadTransactions();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadTransactions();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTransactions();
    }
  }

  getTransactionTypeName(type: number): string {
    const types: { [key: number]: string } = {
      1: 'Nạp tiền',
      2: 'Rút tiền',
    };
    return types[type] || 'Không xác định';
  }

  getTransactionIcon(type: number): string {
    return type === 1 ? 'pi-arrow-down' : 'pi-arrow-up';
  }
}
