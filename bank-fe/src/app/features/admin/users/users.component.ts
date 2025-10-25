import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import {
  AdminService,
  User,
  UserFilters,
} from '../../../core/services/admin.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    ToastModule,
    ProgressSpinnerModule,
    TooltipModule,
  ],
  providers: [MessageService],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  isLoading = false;
  isExporting = false;

  // Expose Math to template
  Math = Math;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;

  // Sorting
  sortField = 'createdAt';
  sortOrder = -1; // -1 for desc, 1 for asc

  // Filters
  filterForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private adminService: AdminService,
    private messageService: MessageService,
    private fb: FormBuilder,
  ) {
    this.filterForm = this.fb.group({
      q: [''],
      role: [''],
      status: [''],
      emailVerified: [''],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.isLoading = true;

    const filters: UserFilters = {
      page: this.currentPage,
      pageSize: this.pageSize,
      sortBy: this.sortField,
      sortOrder: this.sortOrder === 1 ? 'asc' : 'desc',
      ...this.filterForm.value,
    };

    this.adminService
      .getUsers(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('API Response:', response);
          console.log('Users data:', response.data.items);
          this.users = response.data.items;
          this.totalRecords = response.data.total;
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể tải danh sách người dùng',
          });
          this.isLoading = false;
        },
      });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadUsers();
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 1 ? -1 : 1;
    } else {
      this.sortField = field;
      this.sortOrder = 1;
    }
    this.loadUsers();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  exportCsv(): void {
    this.isExporting = true;
    // TODO: Implement CSV export
    setTimeout(() => {
      this.isExporting = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Xuất CSV thành công',
      });
    }, 2000);
  }

  resendVerification(user: User): void {
    // Debug log
    console.log('Resend User object:', user);
    console.log('User ID:', user.id);

    if (!user || !user.id) {
      console.error('User or user.id is missing:', user);
      this.messageService.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không tìm thấy ID người dùng',
      });
      return;
    }

    // Sử dụng ID
    const userId = String(user.id);
    console.log('Using ID for resend:', userId);

    this.adminService
      .resendUserVerification(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã gửi lại email xác thực',
          });
        },
        error: (error) => {
          console.error('Error resending verification:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể gửi lại email xác thực',
          });
        },
      });
  }

  toggleUserStatus(user: User): void {
    const newStatus = user.status === 'active' ? 'locked' : 'active';
    const action = newStatus === 'active' ? 'mở khóa' : 'khóa';

    // Debug log
    console.log('Toggle User object:', user);
    console.log('User ID:', user.id);

    if (!user || !user.id) {
      console.error('User or user.id is missing:', user);
      this.messageService.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không tìm thấy ID người dùng',
      });
      return;
    }

    // Sử dụng ID
    const userId = String(user.id);
    console.log('Using ID for toggle:', userId);

    this.adminService
      .updateUser(userId, { status: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          user.status = newStatus;
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: `Đã ${action} tài khoản ${user.name}`,
          });
        },
        error: (error) => {
          console.error('Error updating user status:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: `Không thể ${action} tài khoản`,
          });
        },
      });
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      user: 'Người dùng',
      admin: 'Quản trị viên',
      superadmin: 'Siêu quản trị viên',
    };
    return labels[role] || 'Người dùng';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Hoạt động',
      locked: 'Khóa',
    };
    return labels[status] || 'Hoạt động';
  }
}
