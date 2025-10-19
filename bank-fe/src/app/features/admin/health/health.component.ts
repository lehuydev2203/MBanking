import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, interval } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';

import {
  AdminService,
  HealthStatus,
} from '../../../core/services/admin.service';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    TagModule,
  ],
  template: `
    <div class="grid">
      <div class="col-12">
        <p-card>
          <ng-template pTemplate="header">
            <div class="p-4">
              <div class="flex justify-content-between align-items-center">
                <div>
                  <h1 class="text-2xl font-bold mb-2">Trạng thái hệ thống</h1>
                  <p class="text-gray-400">
                    Theo dõi tình trạng hoạt động của các dịch vụ
                  </p>
                </div>
                <p-button
                  label="Làm mới"
                  icon="pi pi-refresh"
                  (click)="checkHealth()"
                  [loading]="isLoading"
                >
                </p-button>
              </div>
            </div>
          </ng-template>

          <div class="p-4">
            <div *ngIf="isLoading && !healthStatus; else healthContent">
              <div class="flex justify-content-center p-4">
                <p-progressSpinner
                  [style]="{ width: '50px', height: '50px' }"
                ></p-progressSpinner>
              </div>
            </div>

            <ng-template #healthContent>
              <div *ngIf="healthStatus" class="grid">
                <!-- Overall Status -->
                <div class="col-12 md:col-6 lg:col-3">
                  <div
                    class="p-4 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div
                      class="flex align-items-center justify-content-between mb-3"
                    >
                      <h3 class="text-lg font-semibold">Tổng quan</h3>
                      <p-tag
                        [value]="
                          healthStatus.status === 'healthy'
                            ? 'Khỏe mạnh'
                            : 'Có vấn đề'
                        "
                        [severity]="
                          healthStatus.status === 'healthy'
                            ? 'success'
                            : 'danger'
                        "
                      >
                      </p-tag>
                    </div>
                    <div class="text-sm text-gray-400">
                      <div>Phiên bản: {{ healthStatus.version }}</div>
                      <div>
                        Thời gian hoạt động:
                        {{ formatUptime(healthStatus.uptime) }}
                      </div>
                      <div>
                        Cập nhật:
                        {{
                          healthStatus.timestamp | date: 'dd/MM/yyyy HH:mm:ss'
                        }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Database Status -->
                <div class="col-12 md:col-6 lg:col-3">
                  <div
                    class="p-4 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div
                      class="flex align-items-center justify-content-between mb-3"
                    >
                      <h3 class="text-lg font-semibold">Cơ sở dữ liệu</h3>
                      <p-tag
                        [value]="
                          healthStatus.services.database === 'up'
                            ? 'Hoạt động'
                            : 'Lỗi'
                        "
                        [severity]="
                          healthStatus.services.database === 'up'
                            ? 'success'
                            : 'danger'
                        "
                      >
                      </p-tag>
                    </div>
                    <div class="flex align-items-center gap-2">
                      <i
                        [class]="
                          healthStatus.services.database === 'up'
                            ? 'pi pi-check-circle text-green-400'
                            : 'pi pi-times-circle text-red-400'
                        "
                      >
                      </i>
                      <span class="text-sm">
                        {{
                          healthStatus.services.database === 'up'
                            ? 'Kết nối bình thường'
                            : 'Mất kết nối'
                        }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Redis Status -->
                <div class="col-12 md:col-6 lg:col-3">
                  <div
                    class="p-4 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div
                      class="flex align-items-center justify-content-between mb-3"
                    >
                      <h3 class="text-lg font-semibold">Redis Cache</h3>
                      <p-tag
                        [value]="
                          healthStatus.services.redis === 'up'
                            ? 'Hoạt động'
                            : 'Lỗi'
                        "
                        [severity]="
                          healthStatus.services.redis === 'up'
                            ? 'success'
                            : 'danger'
                        "
                      >
                      </p-tag>
                    </div>
                    <div class="flex align-items-center gap-2">
                      <i
                        [class]="
                          healthStatus.services.redis === 'up'
                            ? 'pi pi-check-circle text-green-400'
                            : 'pi pi-times-circle text-red-400'
                        "
                      >
                      </i>
                      <span class="text-sm">
                        {{
                          healthStatus.services.redis === 'up'
                            ? 'Kết nối bình thường'
                            : 'Mất kết nối'
                        }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- External Services Status -->
                <div class="col-12 md:col-6 lg:col-3">
                  <div
                    class="p-4 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div
                      class="flex align-items-center justify-content-between mb-3"
                    >
                      <h3 class="text-lg font-semibold">Dịch vụ bên ngoài</h3>
                      <p-tag
                        [value]="
                          healthStatus.services.external === 'up'
                            ? 'Hoạt động'
                            : 'Lỗi'
                        "
                        [severity]="
                          healthStatus.services.external === 'up'
                            ? 'success'
                            : 'danger'
                        "
                      >
                      </p-tag>
                    </div>
                    <div class="flex align-items-center gap-2">
                      <i
                        [class]="
                          healthStatus.services.external === 'up'
                            ? 'pi pi-check-circle text-green-400'
                            : 'pi pi-times-circle text-red-400'
                        "
                      >
                      </i>
                      <span class="text-sm">
                        {{
                          healthStatus.services.external === 'up'
                            ? 'Kết nối bình thường'
                            : 'Mất kết nối'
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ng-template>
          </div>
        </p-card>
      </div>
    </div>
  `,
})
export class HealthComponent implements OnInit, OnDestroy {
  healthStatus: HealthStatus | null = null;
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.checkHealth();

    // Auto-refresh every 30 seconds
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkHealth();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkHealth(): void {
    this.isLoading = true;
    this.adminService.getHealth().subscribe({
      next: (health) => {
        this.healthStatus = health;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days} ngày, ${hours} giờ`;
    } else if (hours > 0) {
      return `${hours} giờ, ${minutes} phút`;
    } else {
      return `${minutes} phút`;
    }
  }
}
