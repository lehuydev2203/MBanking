// Transaction Types Enum
export enum TransactionType {
  DEPOSIT = 1, // Nạp tiền
  WITHDRAW = 2, // Rút tiền
  TRANSFER_SEND = 3, // Chuyển khoản (người gửi)
  TRANSFER_RECEIVE = 4, // Nhận tiền (người nhận)
}

// Transaction Type Labels
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TransactionType.DEPOSIT]: 'Nạp tiền',
  [TransactionType.WITHDRAW]: 'Rút tiền',
  [TransactionType.TRANSFER_SEND]: 'Chuyển khoản',
  [TransactionType.TRANSFER_RECEIVE]: 'Nhận tiền',
};

// Transaction Type Icons (PrimeNG icons)
export const TRANSACTION_TYPE_ICONS: Record<TransactionType, string> = {
  [TransactionType.DEPOSIT]: 'pi pi-arrow-down',
  [TransactionType.WITHDRAW]: 'pi pi-arrow-up',
  [TransactionType.TRANSFER_SEND]: 'pi pi-send',
  [TransactionType.TRANSFER_RECEIVE]: 'pi pi-inbox',
};

// Transaction Type Colors (Tailwind CSS classes)
export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  [TransactionType.DEPOSIT]: 'text-green-500',
  [TransactionType.WITHDRAW]: 'text-red-500',
  [TransactionType.TRANSFER_SEND]: 'text-blue-500',
  [TransactionType.TRANSFER_RECEIVE]: 'text-purple-500',
};

// Transaction Type Severity (for PrimeNG components)
export const TRANSACTION_TYPE_SEVERITY: Record<
  TransactionType,
  'success' | 'danger' | 'info' | 'warn'
> = {
  [TransactionType.DEPOSIT]: 'success',
  [TransactionType.WITHDRAW]: 'danger',
  [TransactionType.TRANSFER_SEND]: 'info',
  [TransactionType.TRANSFER_RECEIVE]: 'warn',
};

// Utility functions
export function getTransactionTypeLabel(type: number): string {
  return TRANSACTION_TYPE_LABELS[type as TransactionType] || 'Không xác định';
}

export function getTransactionTypeIcon(type: number): string {
  return TRANSACTION_TYPE_ICONS[type as TransactionType] || 'pi pi-question';
}

export function getTransactionTypeColor(type: number): string {
  return TRANSACTION_TYPE_COLORS[type as TransactionType] || 'text-gray-500';
}

export function getTransactionTypeSeverity(
  type: number,
): 'success' | 'danger' | 'info' | 'warn' {
  return TRANSACTION_TYPE_SEVERITY[type as TransactionType] || 'info';
}

export function isIncomingTransaction(type: number): boolean {
  return (
    type === TransactionType.DEPOSIT ||
    type === TransactionType.TRANSFER_RECEIVE
  );
}

export function isOutgoingTransaction(type: number): boolean {
  return (
    type === TransactionType.WITHDRAW || type === TransactionType.TRANSFER_SEND
  );
}

export function isTransferTransaction(type: number): boolean {
  return (
    type === TransactionType.TRANSFER_SEND ||
    type === TransactionType.TRANSFER_RECEIVE
  );
}

export function isDepositOrWithdraw(type: number): boolean {
  return type === TransactionType.DEPOSIT || type === TransactionType.WITHDRAW;
}

// Transaction interface
export interface Transaction {
  _id: string;
  accountId: string;
  transName: string;
  transMoney: number;
  transType: TransactionType;
  clientRequestId?: string;
  createdAt: string;
  updatedAt: string;
}

// Transaction with parsed type info
export interface TransactionWithTypeInfo extends Transaction {
  typeLabel: string;
  typeIcon: string;
  typeColor: string;
  typeSeverity: 'success' | 'danger' | 'info' | 'warn';
  isIncoming: boolean;
  isOutgoing: boolean;
  isTransfer: boolean;
}

// Helper function to add type info to transaction
export function addTransactionTypeInfo(
  transaction: Transaction,
): TransactionWithTypeInfo {
  return {
    ...transaction,
    typeLabel: getTransactionTypeLabel(transaction.transType),
    typeIcon: getTransactionTypeIcon(transaction.transType),
    typeColor: getTransactionTypeColor(transaction.transType),
    typeSeverity: getTransactionTypeSeverity(transaction.transType),
    isIncoming: isIncomingTransaction(transaction.transType),
    isOutgoing: isOutgoingTransaction(transaction.transType),
    isTransfer: isTransferTransaction(transaction.transType),
  };
}
