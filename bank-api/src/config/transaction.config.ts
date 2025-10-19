import { registerAs } from '@nestjs/config';

export default registerAs('transaction', () => ({
  maxTransactionAmount: parseInt(
    process.env.MAX_TRANSACTION_AMOUNT || '20000000',
    10,
  ),
  dailyWithdrawalLimit: parseInt(
    process.env.DAILY_WITHDRAWAL_LIMIT || '500000000',
    10,
  ),
}));
