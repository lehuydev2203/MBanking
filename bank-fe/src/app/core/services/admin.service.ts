import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserFilters {
  q?: string;
  role?: string;
  status?: string;
  email?: string;
  page?: number;
  pageSize?: number;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UpdateUserRequest {
  role?: string;
  status?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    external: 'up' | 'down';
  };
  uptime: number;
  version: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private apiService: ApiService) {}

  listUsers(filters: UserFilters = {}): Observable<UserListResponse> {
    return this.apiService.get<UserListResponse>(
      API_ENDPOINTS.ADMIN.USERS.LIST,
      filters,
    );
  }

  updateUserRoleStatus(
    userId: string,
    body: UpdateUserRequest,
  ): Observable<User> {
    return this.apiService.patch<User>(
      API_ENDPOINTS.ADMIN.USERS.UPDATE(userId),
      body,
    );
  }

  resendUserVerification(userId: string): Observable<any> {
    return this.apiService.post(
      API_ENDPOINTS.ADMIN.USERS.RESEND_VERIFICATION(userId),
      {},
    );
  }

  adminListTransactions(filters: any = {}): Observable<any> {
    return this.apiService.get(API_ENDPOINTS.ADMIN.TRANSACTIONS.LIST, filters);
  }

  getHealth(): Observable<HealthStatus> {
    return this.apiService.get<HealthStatus>(API_ENDPOINTS.SYSTEM.HEALTH);
  }
}
