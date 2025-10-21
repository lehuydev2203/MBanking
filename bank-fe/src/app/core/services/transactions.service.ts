import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { components, operations } from '../api-types';
import { API_ENDPOINTS } from '../constants/api.constants';

// Import transaction types
import {
  TransactionType,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_ICONS,
  TRANSACTION_TYPE_COLORS,
  getTransactionTypeLabel,
  getTransactionTypeIcon,
  getTransactionTypeColor,
  isIncomingTransaction,
  isOutgoingTransaction,
  Transaction as TransactionData,
  TransactionWithTypeInfo,
  addTransactionTypeInfo,
} from '../types/transaction.types';

// Re-export transaction types
export {
  TransactionType,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_ICONS,
  TRANSACTION_TYPE_COLORS,
  getTransactionTypeLabel,
  getTransactionTypeIcon,
  getTransactionTypeColor,
  isIncomingTransaction,
  isOutgoingTransaction,
  addTransactionTypeInfo,
};

export type { TransactionData, TransactionWithTypeInfo };

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
export interface LegacyTransaction {
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
      API_ENDPOINTS.TRANSACTIONS.LIST,
      filters,
    );
  }

  deposit(body: DepositRequest): Observable<TransactionData> {
    return this.apiService.post<TransactionData>(
      API_ENDPOINTS.TRANSACTIONS.DEPOSIT,
      body,
    );
  }

  canWithdraw(amount: number): Observable<WithdrawCheckResponse> {
    return this.apiService.get<WithdrawCheckResponse>(
      API_ENDPOINTS.TRANSACTIONS.CAN_WITHDRAW,
      { amount },
    );
  }

  withdraw(body: WithdrawRequest): Observable<TransactionData> {
    return this.apiService.post<TransactionData>(
      API_ENDPOINTS.TRANSACTIONS.WITHDRAW,
      body,
    );
  }

  exportCsv(filters: TransactionFilters = {}): Observable<Blob> {
    return this.apiService.getBlob(
      API_ENDPOINTS.TRANSACTIONS.EXPORT_CSV,
      filters,
    );
  }

  getTransaction(id: string): Observable<TransactionData> {
    return this.apiService.get<TransactionData>(
      API_ENDPOINTS.TRANSACTIONS.GET_BY_ID(id),
    );
  }

  // Transfer methods
  initiateTransfer(
    body: TransferRequest,
  ): Observable<TransferInitiateResponse> {
    return this.apiService.post<TransferInitiateResponse>(
      API_ENDPOINTS.TRANSFERS.INITIATE,
      body,
    );
  }

  confirmTransfer(
    body: TransferConfirmRequest,
  ): Observable<TransferConfirmResponse> {
    return this.apiService.post<TransferConfirmResponse>(
      API_ENDPOINTS.TRANSFERS.CONFIRM,
      body,
    );
  }

  setNickname(body: SetNicknameRequest): Observable<any> {
    return this.apiService.post<any>(
      API_ENDPOINTS.TRANSFERS.SET_NICKNAME,
      body,
    );
  }

  // Legacy transfer history (deprecated)
  getTransferHistory(page: number = 1, pageSize: number = 10): Observable<any> {
    return this.apiService.get<any>(API_ENDPOINTS.TRANSFERS.HISTORY, {
      page,
      pageSize,
    });
  }
}
