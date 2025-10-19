import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { Decimal128 } from 'mongodb';
import {
  Transaction,
  TransactionDocument,
  TransactionType,
} from '../../database/schemas/transaction.schema';
import {
  Account,
  AccountDocument,
} from '../../database/schemas/account.schema';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { TimezoneUtil } from '../../common/utils/timezone.util';
import { AuditService } from '../audit/audit.service';
import transactionConfig from '../../config/transaction.config';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    private auditService: AuditService,
  ) {}

  async canWithdraw(userId: string, amount: number) {
    const account = await this.accountModel.findById(userId);
    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const reasons: string[] = [];
    const balance = parseFloat(account.balance.toString());

    // Check account balance
    if (balance < amount) {
      reasons.push('Insufficient account balance');
    }

    // Check per-transaction limit
    if (amount > transactionConfig().maxTransactionAmount) {
      reasons.push(
        `Amount exceeds per-transaction limit of ${transactionConfig().maxTransactionAmount.toLocaleString()} VND`,
      );
    }

    // Check daily limit
    const todayStart = TimezoneUtil.getStartOfDay();
    const todayEnd = TimezoneUtil.getEndOfDay();

    const dailyUsed = await this.getDailyWithdrawalAmount(
      userId,
      todayStart,
      todayEnd,
    );

    if (dailyUsed + amount > transactionConfig().dailyWithdrawalLimit) {
      reasons.push(
        `Amount would exceed daily withdrawal limit of ${transactionConfig().dailyWithdrawalLimit.toLocaleString()} VND`,
      );
    }

    return {
      allowed: reasons.length === 0,
      reasons,
      balance,
      dailyUsed,
      dailyLimit: transactionConfig().dailyWithdrawalLimit,
    };
  }

  async deposit(userId: string, depositDto: DepositDto) {
    const { amount, transName, clientRequestId } = depositDto;

    // Check for idempotency
    if (clientRequestId) {
      const existingTransaction = await this.transactionModel.findOne({
        accountId: userId,
        clientRequestId,
        transType: TransactionType.DEPOSIT,
      });

      if (existingTransaction) {
        return {
          ...existingTransaction.toJSON(),
          code: 'IDEMPOTENT_REPLAY',
        };
      }
    }

    const session: ClientSession =
      await this.transactionModel.db.startSession();

    try {
      await session.withTransaction(async () => {
        // Create transaction record
        const transaction = new this.transactionModel({
          accountId: userId,
          transName: transName || 'Deposit',
          transMoney: Decimal128.fromString(amount.toString()),
          transType: TransactionType.DEPOSIT,
          clientRequestId,
        });

        await transaction.save({ session });

        // Update account balance
        await this.accountModel.findByIdAndUpdate(
          userId,
          { $inc: { balance: Decimal128.fromString(amount.toString()) } },
          { session },
        );

        // Log audit
        await this.auditService.log({
          actorId: userId,
          action: 'DEPOSIT',
          resource: 'transaction',
          meta: {
            transactionId: (transaction as any)._id.toString(),
            amount,
            clientRequestId,
          },
        });
      });

      // Return the transaction without session
      const transaction = await this.transactionModel.findOne({
        accountId: userId,
        clientRequestId,
        transType: TransactionType.DEPOSIT,
      });

      return transaction;
    } finally {
      await session.endSession();
    }
  }

  async withdraw(userId: string, withdrawDto: WithdrawDto) {
    const { amount, transName, clientRequestId } = withdrawDto;

    // Check withdrawal constraints
    const canWithdrawResult = await this.canWithdraw(userId, amount);
    if (!canWithdrawResult.allowed) {
      if (
        canWithdrawResult.reasons.some((r) =>
          r.includes('Insufficient account balance'),
        )
      ) {
        throw new ForbiddenException({
          code: 'INSUFFICIENT_FUNDS',
          message: 'Insufficient account balance',
        });
      }
      if (
        canWithdrawResult.reasons.some((r) =>
          r.includes('per-transaction limit'),
        )
      ) {
        throw new ForbiddenException({
          code: 'LIMIT_PER_TRANSACTION',
          message: `Amount exceeds per-transaction limit of ${transactionConfig().maxTransactionAmount.toLocaleString()} VND`,
        });
      }
      if (
        canWithdrawResult.reasons.some((r) =>
          r.includes('daily withdrawal limit'),
        )
      ) {
        throw new ForbiddenException({
          code: 'DAILY_LIMIT_EXCEEDED',
          message: `Amount would exceed daily withdrawal limit of ${transactionConfig().dailyWithdrawalLimit.toLocaleString()} VND`,
        });
      }
    }

    // Check for idempotency
    if (clientRequestId) {
      const existingTransaction = await this.transactionModel.findOne({
        accountId: userId,
        clientRequestId,
        transType: TransactionType.WITHDRAW,
      });

      if (existingTransaction) {
        return {
          ...existingTransaction.toJSON(),
          code: 'IDEMPOTENT_REPLAY',
        };
      }
    }

    const session: ClientSession =
      await this.transactionModel.db.startSession();

    try {
      await session.withTransaction(async () => {
        // Double-check balance in transaction
        const account = await this.accountModel.findById(userId, null, {
          session,
        });
        if (!account) {
          throw new BadRequestException('Account not found');
        }

        const currentBalance = parseFloat(account.balance.toString());
        if (currentBalance < amount) {
          throw new ForbiddenException({
            code: 'INSUFFICIENT_FUNDS',
            message: 'Insufficient account balance',
          });
        }

        // Create transaction record
        const transaction = new this.transactionModel({
          accountId: userId,
          transName: transName || 'Withdrawal',
          transMoney: Decimal128.fromString(amount.toString()),
          transType: TransactionType.WITHDRAW,
          clientRequestId,
        });

        await transaction.save({ session });

        // Update account balance
        await this.accountModel.findByIdAndUpdate(
          userId,
          { $inc: { balance: Decimal128.fromString((-amount).toString()) } },
          { session },
        );

        // Log audit
        await this.auditService.log({
          actorId: userId,
          action: 'WITHDRAW',
          resource: 'transaction',
          meta: {
            transactionId: (transaction as any)._id.toString(),
            amount,
            clientRequestId,
          },
        });
      });

      // Return the transaction without session
      const transaction = await this.transactionModel.findOne({
        accountId: userId,
        clientRequestId,
        transType: TransactionType.WITHDRAW,
      });

      return transaction;
    } finally {
      await session.endSession();
    }
  }

  async getTransactions(userId: string, query: TransactionQueryDto) {
    const { page = 1, pageSize = 10, type, from, to, min, max } = query;

    const filter: any = { accountId: userId };

    if (type !== undefined) {
      filter.transType = type;
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    if (min !== undefined || max !== undefined) {
      filter.transMoney = {};
      if (min !== undefined)
        filter.transMoney.$gte = Decimal128.fromString(min.toString());
      if (max !== undefined)
        filter.transMoney.$lte = Decimal128.fromString(max.toString());
    }

    const skip = (page - 1) * pageSize;
    const total = await this.transactionModel.countDocuments(filter);

    const transactions = await this.transactionModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    return {
      items: transactions.map((t) => {
        const transaction: any = {
          ...t,
          transMoney: parseFloat(t.transMoney.toString()),
        };

        // Phân loại giao dịch
        if (t.transName.includes('Transfer to')) {
          transaction.transactionCategory = 'TRANSFER_SENT';
          transaction.transactionTypeLabel = 'Chuyển khoản đi';
        } else if (t.transName.includes('Transfer from')) {
          transaction.transactionCategory = 'TRANSFER_RECEIVED';
          transaction.transactionTypeLabel = 'Chuyển khoản đến';
        } else if (t.transType === TransactionType.DEPOSIT) {
          transaction.transactionCategory = 'DEPOSIT';
          transaction.transactionTypeLabel = 'Nạp tiền';
        } else if (t.transType === TransactionType.WITHDRAW) {
          transaction.transactionCategory = 'WITHDRAW';
          transaction.transactionTypeLabel = 'Rút tiền';
        }

        return transaction;
      }),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async exportTransactions(
    userId: string,
    query: Omit<TransactionQueryDto, 'page' | 'pageSize'>,
  ) {
    const { type, from, to, min, max } = query;

    const filter: any = { accountId: userId };

    if (type !== undefined) {
      filter.transType = type;
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    if (min !== undefined || max !== undefined) {
      filter.transMoney = {};
      if (min !== undefined)
        filter.transMoney.$gte = Decimal128.fromString(min.toString());
      if (max !== undefined)
        filter.transMoney.$lte = Decimal128.fromString(max.toString());
    }

    const transactions = await this.transactionModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return transactions.map((t) => {
      const transaction: any = {
        id: t._id.toString(),
        accountId: t.accountId.toString(),
        transName: t.transName,
        transMoney: parseFloat(t.transMoney.toString()),
        transType: t.transType,
        clientRequestId: t.clientRequestId,
        createdAt: t.createdAt,
      };

      // Phân loại giao dịch cho export
      if (t.transName.includes('Transfer to')) {
        transaction.transactionCategory = 'TRANSFER_SENT';
        transaction.transactionTypeLabel = 'Chuyển khoản đi';
      } else if (t.transName.includes('Transfer from')) {
        transaction.transactionCategory = 'TRANSFER_RECEIVED';
        transaction.transactionTypeLabel = 'Chuyển khoản đến';
      } else if (t.transType === TransactionType.DEPOSIT) {
        transaction.transactionCategory = 'DEPOSIT';
        transaction.transactionTypeLabel = 'Nạp tiền';
      } else if (t.transType === TransactionType.WITHDRAW) {
        transaction.transactionCategory = 'WITHDRAW';
        transaction.transactionTypeLabel = 'Rút tiền';
      }

      return transaction;
    });
  }

  private async getDailyWithdrawalAmount(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.transactionModel.aggregate([
      {
        $match: {
          accountId: userId,
          transType: TransactionType.WITHDRAW,
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$transMoney' },
        },
      },
    ]);

    return result.length > 0 ? parseFloat(result[0].total.toString()) : 0;
  }
}
