import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import { forkJoin } from 'rxjs';

interface DashboardStats {
  totalUsers: number;
  totalTransactions: number;
  unverifiedEmails: number;
  systemHealth: any;
}

@Component({
  selector: 'app-general',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, DecimalPipe],
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss',
})
export class GeneralComponent implements OnInit {
  stats: Partial<DashboardStats> = {};
  isLoading = true;
  recentTransactions: any[] = [];
  unverifiedUsers: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    forkJoin({
      users: this.adminService.getUsers({ page: 1, pageSize: 1 }),
      transactions: this.adminService.getTransactions({
        page: 1,
        pageSize: 10,
      }),
      health: this.adminService.getHealthStatus(),
    }).subscribe({
      next: (data) => {
        this.stats.totalUsers = data.users.data.total;
        this.stats.totalTransactions = data.transactions.data?.total || 0;
        this.stats.systemHealth = data.health;

        // Get recent transactions
        this.recentTransactions = data.transactions.data?.items || [];

        // Get unverified users
        this.loadUnverifiedUsers();

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.isLoading = false;
      },
    });
  }

  loadUnverifiedUsers(): void {
    this.adminService
      .getUsers({ emailVerified: 'false', pageSize: 10 })
      .subscribe({
        next: (response) => {
          this.unverifiedUsers = response.data.items;
          this.stats.unverifiedEmails = response.data.total;
        },
        error: (error) => {
          console.error('Error loading unverified users:', error);
        },
      });
  }
}
