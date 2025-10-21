# Transaction Types

## Overview

Transaction types được định nghĩa trong `transaction.types.ts` để quản lý các loại giao dịch trong hệ thống ngân hàng.

## Transaction Types

```typescript
export enum TransactionType {
  DEPOSIT = 1, // Nạp tiền
  WITHDRAW = 2, // Rút tiền
  TRANSFER_SEND = 3, // Chuyển khoản (người gửi)
  TRANSFER_RECEIVE = 4, // Nhận tiền (người nhận)
}
```

## Usage Examples

### 1. Basic Usage

```typescript
import { TransactionType, getTransactionTypeLabel, getTransactionTypeIcon, getTransactionTypeColor } from "../core/types/transaction.types";

// Get label
const label = getTransactionTypeLabel(TransactionType.DEPOSIT); // "Nạp tiền"

// Get icon
const icon = getTransactionTypeIcon(TransactionType.WITHDRAW); // "pi pi-arrow-up"

// Get color
const color = getTransactionTypeColor(TransactionType.TRANSFER_SEND); // "text-blue-500"
```

### 2. In Component Template

```html
<!-- Transaction Type Badge -->
<p-badge [value]="getTransactionTypeLabel(transaction.transType)" [severity]="getTransactionTypeSeverity(transaction.transType)" [icon]="getTransactionTypeIcon(transaction.transType)"> </p-badge>

<!-- Transaction Icon -->
<i [class]="getTransactionTypeIcon(transaction.transType)"></i>

<!-- Transaction Amount with Color -->
<span [class]="getTransactionTypeColor(transaction.transType)"> {{ transaction.transMoney | currencyVnd }} </span>
```

### 3. Conditional Logic

```typescript
import { isIncomingTransaction, isOutgoingTransaction } from "../core/types/transaction.types";

// Check if transaction is incoming
if (isIncomingTransaction(transaction.transType)) {
  // Handle incoming transaction (deposit, receive)
}

// Check if transaction is outgoing
if (isOutgoingTransaction(transaction.transType)) {
  // Handle outgoing transaction (withdraw, send)
}
```

### 4. Transaction with Type Info

```typescript
import { addTransactionTypeInfo, Transaction } from "../core/types/transaction.types";

const transaction: Transaction = {
  _id: "...",
  accountId: "...",
  transName: "Deposit",
  transMoney: 1000000,
  transType: TransactionType.DEPOSIT,
  createdAt: "...",
  updatedAt: "...",
};

// Add type info to transaction
const transactionWithInfo = addTransactionTypeInfo(transaction);
console.log(transactionWithInfo.typeLabel); // "Nạp tiền"
console.log(transactionWithInfo.typeIcon); // "pi pi-arrow-down"
console.log(transactionWithInfo.isIncoming); // true
```

## Available Functions

### Type Information

- `getTransactionTypeLabel(type: number): string` - Get human-readable label
- `getTransactionTypeIcon(type: number): string` - Get PrimeNG icon class
- `getTransactionTypeColor(type: number): string` - Get Tailwind color class
- `getTransactionTypeSeverity(type: number): string` - Get PrimeNG severity

### Type Classification

- `isIncomingTransaction(type: number): boolean` - Check if incoming (deposit, receive)
- `isOutgoingTransaction(type: number): boolean` - Check if outgoing (withdraw, send)
- `isTransferTransaction(type: number): boolean` - Check if transfer (send, receive)
- `isDepositOrWithdraw(type: number): boolean` - Check if deposit or withdraw

### Utility

- `addTransactionTypeInfo(transaction: Transaction): TransactionWithTypeInfo` - Add type info to transaction

## Constants

### Labels

```typescript
TRANSACTION_TYPE_LABELS = {
  [TransactionType.DEPOSIT]: "Nạp tiền",
  [TransactionType.WITHDRAW]: "Rút tiền",
  [TransactionType.TRANSFER_SEND]: "Chuyển khoản",
  [TransactionType.TRANSFER_RECEIVE]: "Nhận tiền",
};
```

### Icons (PrimeNG)

```typescript
TRANSACTION_TYPE_ICONS = {
  [TransactionType.DEPOSIT]: "pi pi-arrow-down",
  [TransactionType.WITHDRAW]: "pi pi-arrow-up",
  [TransactionType.TRANSFER_SEND]: "pi pi-send",
  [TransactionType.TRANSFER_RECEIVE]: "pi pi-inbox",
};
```

### Colors (Tailwind CSS)

```typescript
TRANSACTION_TYPE_COLORS = {
  [TransactionType.DEPOSIT]: "text-green-500",
  [TransactionType.WITHDRAW]: "text-red-500",
  [TransactionType.TRANSFER_SEND]: "text-blue-500",
  [TransactionType.TRANSFER_RECEIVE]: "text-purple-500",
};
```

### Severity (PrimeNG)

```typescript
TRANSACTION_TYPE_SEVERITY = {
  [TransactionType.DEPOSIT]: "success",
  [TransactionType.WITHDRAW]: "danger",
  [TransactionType.TRANSFER_SEND]: "info",
  [TransactionType.TRANSFER_RECEIVE]: "warn",
};
```

## Best Practices

1. **Always use the enum values** instead of magic numbers
2. **Use utility functions** instead of hardcoding labels/icons
3. **Import from the types file** for consistency
4. **Use type-safe functions** for conditional logic
5. **Leverage the TransactionWithTypeInfo interface** for enhanced transaction objects
