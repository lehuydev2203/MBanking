/**
 * API Endpoints Constants
 * Tập trung tất cả API endpoints để dễ quản lý và thay đổi
 */

export const API_ENDPOINTS = {
  // ==================== AUTHENTICATION ====================
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY: '/auth/verify',
    RESEND_VERIFICATION: '/auth/resend-verification',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // ==================== USER PROFILE & ACCOUNT ====================
  PROFILE: {
    GET: '/profile',
    UPDATE: '/profile',
    SET_NICKNAME: '/profile/nickname',
  },

  BALANCE: {
    GET: '/balance',
  },

  // ==================== TRANSACTIONS ====================
  TRANSACTIONS: {
    LIST: '/transactions',
    DEPOSIT: '/transactions/deposit',
    WITHDRAW: '/transactions/withdraw',
    CAN_WITHDRAW: '/transactions/can-withdraw',
    EXPORT_CSV: '/transactions/export.csv',
    GET_BY_ID: (id: string) => `/transactions/${id}`,
  },

  // ==================== TRANSFERS ====================
  TRANSFERS: {
    INITIATE: '/transfers/initiate',
    CONFIRM: '/transfers/confirm',
    SET_NICKNAME: '/transfers/nickname',
    HISTORY: '/transfers/history', // Deprecated
  },

  // ==================== ADMIN PANEL ====================
  ADMIN: {
    USERS: {
      LIST: '/admin/users',
      UPDATE: (userId: string) => `/admin/users/${userId}`,
      RESEND_VERIFICATION: (userId: string) =>
        `/admin/users/${userId}/resend-verification`,
    },
    TRANSACTIONS: {
      LIST: '/admin/transactions',
    },
  },

  // ==================== SYSTEM ====================
  SYSTEM: {
    HEALTH: '/health',
    ROOT: '/',
  },

  // ==================== LEGACY/WALLET ====================
  WALLET: {
    CAN_WITHDRAW: '/wallet/can-withdraw', // Legacy - use TRANSACTIONS.CAN_WITHDRAW instead
  },
} as const;

/**
 * API Response Types
 */
export const API_RESPONSE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

/**
 * Transaction Types
 */
export const TRANSACTION_TYPES = {
  DEPOSIT: 1,
  WITHDRAW: 2,
} as const;

/**
 * Transaction Categories
 */
export const TRANSACTION_CATEGORIES = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAW: 'WITHDRAW',
  TRANSFER_SENT: 'TRANSFER_SENT',
  TRANSFER_RECEIVED: 'TRANSFER_RECEIVED',
} as const;

/**
 * User Roles
 */
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
} as const;

/**
 * User Status
 */
export const USER_STATUS = {
  ACTIVE: 'active',
  LOCKED: 'locked',
} as const;

/**
 * Transaction Status
 */
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

/**
 * Error Codes
 */
export const ERROR_CODES = {
  // Authentication Errors
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  INVALID_CODE: 'INVALID_CODE',
  CODE_EXPIRED: 'CODE_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Transaction Errors
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  LIMIT_PER_TRANSACTION: 'LIMIT_PER_TRANSACTION',
  DAILY_LIMIT_EXCEEDED: 'DAILY_LIMIT_EXCEEDED',
  IDEMPOTENT_REPLAY: 'IDEMPOTENT_REPLAY',

  // Transfer Errors
  RECIPIENT_NOT_FOUND: 'RECIPIENT_NOT_FOUND',
  SELF_TRANSFER: 'SELF_TRANSFER',
  NICKNAME_TAKEN: 'NICKNAME_TAKEN',

  // System Errors
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
} as const;
