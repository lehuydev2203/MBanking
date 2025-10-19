import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { components, operations } from '../api-types';

// Re-export types from generated API types
export type TransactionListResponse =
  components['schemas']['PaginatedResponseDto'];
export type DepositRequest = components['schemas']['DepositDto'];
export type WithdrawRequest = components['schemas']['WithdrawDto'];
export type WithdrawCheckResponse =
  components['schemas']['CanWithdrawResponseDto'];

// Transfer related types
export type TransferRequest = components['schemas']['TransferRequestDto'];
export type TransferInitiateResponse =
  components['schemas']['TransferInitiateResponseDto'];
export type TransferConfirmRequest =
  components['schemas']['TransferConfirmDto'];
export type TransferConfirmResponse =
  components['schemas']['TransferConfirmResponseDto'];
export type SetNicknameRequest = components['schemas']['SetNicknameDto'];

// Legacy types for backward compatibility
export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  amount: number;
  balance: number;
  description?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  clientRequestId?: string;
}

export interface TransactionFilters {
  type?: 'deposit' | 'withdraw' | 'transfer';
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  min?: number;
  max?: number;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
}

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  constructor(private apiService: ApiService) {}

  list(filters: TransactionFilters = {}): Observable<TransactionListResponse> {
    return this.apiService.get<TransactionListResponse>(
      '/transactions',
      filters,
    );
  }

  deposit(body: DepositRequest): Observable<Transaction> {
    return this.apiService.post<Transaction>('/transactions/deposit', body);
  }

  canWithdraw(amount: number): Observable<WithdrawCheckResponse> {
    return this.apiService.get<WithdrawCheckResponse>(
      '/transactions/can-withdraw',
      { amount },
    );
  }

  withdraw(body: WithdrawRequest): Observable<Transaction> {
    return this.apiService.post<Transaction>('/transactions/withdraw', body);
  }

  exportCsv(filters: TransactionFilters = {}): Observable<Blob> {
    return this.apiService.postBlob('/transactions/export', filters);
  }

  getTransaction(id: string): Observable<Transaction> {
    return this.apiService.get<Transaction>(`/transactions/${id}`);
  }

  // Transfer methods
  initiateTransfer(
    body: TransferRequest,
  ): Observable<TransferInitiateResponse> {
    return this.apiService.post<TransferInitiateResponse>(
      '/transfers/initiate',
      body,
    );
  }

  confirmTransfer(
    body: TransferConfirmRequest,
  ): Observable<TransferConfirmResponse> {
    return this.apiService.post<TransferConfirmResponse>(
      '/transfers/confirm',
      body,
    );
  }

  setNickname(body: SetNicknameRequest): Observable<any> {
    return this.apiService.post<any>('/transfers/nickname', body);
  }

  // Legacy transfer history (deprecated)
  getTransferHistory(page: number = 1, pageSize: number = 10): Observable<any> {
    return this.apiService.get<any>('/transfers/history', { page, pageSize });
  }
}
