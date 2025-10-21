import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

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
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CardModule,
    ProgressSpinnerModule,
    TagModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="grid">
      <div class="col-12">
        <p-card>
          <ng-template pTemplate="header">
            <div class="p-4">
              <h1 class="text-2xl font-bold mb-2">Quản lý người dùng</h1>
              <p class="text-gray-400">
                Quản lý tài khoản người dùng trong hệ thống
              </p>
            </div>
          </ng-template>

          <!-- Filters -->
          <form
            [formGroup]="filterForm"
            (ngSubmit)="applyFilters()"
            class="p-4 border-bottom-1 border-gray-700"
          >
            <div class="grid">
              <div class="col-12 md:col-3">
                <label class="block text-sm font-medium mb-2">Tìm kiếm</label>
                <input
                  pInputText
                  formControlName="q"
                  placeholder="Tên, email..."
                  class="w-full"
                />
              </div>

              <div class="col-12 md:col-3">
                <label class="block text-sm font-medium mb-2">Vai trò</label>
                <p-select
                  formControlName="role"
                  [options]="roleOptions"
                  placeholder="Tất cả"
                  class="w-full"
                >
                </p-select>
              </div>

              <div class="col-12 md:col-3">
                <label class="block text-sm font-medium mb-2">Trạng thái</label>
                <p-select
                  formControlName="status"
                  [options]="statusOptions"
                  placeholder="Tất cả"
                  class="w-full"
                >
                </p-select>
              </div>

              <div class="col-12 md:col-3 flex align-items-end gap-2">
                <p-button
                  type="submit"
                  label="Lọc"
                  icon="pi pi-filter"
                  class="p-button-outlined"
                >
                </p-button>
                <p-button
                  type="button"
                  label="Xóa bộ lọc"
                  icon="pi pi-times"
                  class="p-button-text"
                  (click)="clearFilters()"
                >
                </p-button>
              </div>
            </div>
          </form>

          <!-- Users Table -->
          <div class="p-4">
            @if (isLoading) {
              <div class="flex justify-content-center p-4">
                <p-progressSpinner
                  [style]="{ width: '50px', height: '50px' }"
                ></p-progressSpinner>
              </div>
            } @else {
              <p-table
                [value]="users"
                [paginator]="true"
                [rows]="pageSize"
                [totalRecords]="totalRecords"
                [lazy]="true"
                (onLazyLoad)="loadUsers($event)"
                styleClass="p-datatable-sm"
              >
                <ng-template pTemplate="header">
                  <tr>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </ng-template>

                <ng-template pTemplate="body" let-user>
                  <tr>
                    <td>{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.phone || '-' }}</td>
                    <td>
                      <p-tag
                        [value]="getRoleLabel(user.role)"
                        [severity]="getRoleSeverity(user.role)"
                      >
                      </p-tag>
                    </td>
                    <td>
                      <p-tag
                        [value]="getStatusLabel(user.status)"
                        [severity]="getStatusSeverity(user.status)"
                      >
                      </p-tag>
                    </td>
                    <td>{{ user.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
                    <td>
                      <div class="flex gap-2">
                        <p-button
                          icon="pi pi-pencil"
                          class="p-button-sm p-button-outlined"
                          (click)="editUser(user)"
                          aria-label="Chỉnh sửa"
                        >
                        </p-button>
                        <p-button
                          icon="pi pi-envelope"
                          class="p-button-sm p-button-outlined"
                          (click)="resendVerification(user)"
                          aria-label="Gửi lại email xác thực"
                        >
                        </p-button>
                      </div>
                    </td>
                  </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="7" class="text-center p-4">
                      <div class="flex flex-column align-items-center gap-2">
                        <i class="pi pi-users text-4xl text-gray-400"></i>
                        <p class="text-gray-400">
                          Không tìm thấy người dùng nào
                        </p>
                      </div>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            }
          </div>
        </p-card>
      </div>
    </div>

    <p-confirmDialog></p-confirmDialog>
  `,
})
export class UsersComponent implements OnInit, OnDestroy {
  filterForm: FormGroup;
  users: User[] = [];
  totalRecords = 0;
  pageSize = 10;
  isLoading = false;

  roleOptions = [
    { label: 'Tất cả', value: null },
    { label: 'Người dùng', value: 'user' },
    { label: 'Quản trị viên', value: 'admin' },
    { label: 'Siêu quản trị viên', value: 'superadmin' },
  ];

  statusOptions = [
    { label: 'Tất cả', value: null },
    { label: 'Hoạt động', value: 'active' },
    { label: 'Tạm khóa', value: 'suspended' },
    { label: 'Chưa xác thực', value: 'unverified' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
    this.filterForm = this.fb.group({
      q: [''],
      role: [null],
      status: [null],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(event?: any): void {
    this.isLoading = true;

    const filters: UserFilters = {
      page: event ? event.first / event.rows + 1 : 1,
      pageSize: event ? event.rows : this.pageSize,
      ...this.filterForm.value,
    };

    this.adminService.listUsers(filters).subscribe({
      next: (response) => {
        this.users = response.users;
        this.totalRecords = response.total;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    this.loadUsers();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.loadUsers();
  }

  editUser(user: User): void {
    // TODO: Implement edit user modal
    this.messageService.add({
      severity: 'info',
      summary: 'Chức năng đang phát triển',
      detail:
        'Chỉnh sửa người dùng sẽ được triển khai trong phiên bản tiếp theo',
      life: 3000,
    });
  }

  resendVerification(user: User): void {
    this.confirmationService.confirm({
      message: `Bạn có chắc chắn muốn gửi lại email xác thực cho ${user.name}?`,
      header: 'Xác nhận gửi email',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Gửi',
      rejectLabel: 'Hủy',
      accept: () => {
        this.adminService.resendUserVerification(user.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Gửi email thành công',
              detail: `Đã gửi email xác thực cho ${user.name}`,
              life: 3000,
            });
          },
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
    return labels[role] || role;
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
      user: 'info',
      admin: 'warn',
      superadmin: 'danger',
    };
    return severities[role] || 'info';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Hoạt động',
      suspended: 'Tạm khóa',
      unverified: 'Chưa xác thực',
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
      active: 'success',
      suspended: 'danger',
      unverified: 'warn',
    };
    return severities[status] || 'info';
  }
}
