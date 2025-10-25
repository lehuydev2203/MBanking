import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  accountNumber: string;
  nickname?: string;
  role: 'user' | 'admin' | 'superadmin';
  status: 'active' | 'locked';
  balance: number;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
}

export interface UserFilters {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  q?: string;
  role?: string;
  status?: string;
  emailVerified?: string;
}

export interface UsersResponse {
  success: boolean;
  data: {
    items: User[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface UpdateUserRequest {
  role?: 'user' | 'admin' | 'superadmin';
  status?: 'active' | 'locked';
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    email: 'up' | 'down';
  };
  version: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly baseUrl = `${environment.baseApiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getUsers(filters: UserFilters = {}): Observable<UsersResponse> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<UsersResponse>(`${this.baseUrl}/users`, { params });
  }

  updateUser(userId: string, updates: UpdateUserRequest): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/users/${userId}`, updates);
  }

  resendUserVerification(userId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/users/${userId}/resend-verification`,
      {},
    );
  }

  getTransactions(filters: any = {}): Observable<any> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<any>(`${this.baseUrl}/transactions`, { params });
  }

  getHealthStatus(): Observable<HealthStatus> {
    return this.http.get<HealthStatus>(`${environment.baseApiUrl}/health`);
  }
}
