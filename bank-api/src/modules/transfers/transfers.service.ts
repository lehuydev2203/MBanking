import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { Decimal128 } from 'mongodb';
import {
  Account,
  AccountDocument,
} from '../../database/schemas/account.schema';
import {
  TransferVerification,
  TransferVerificationDocument,
} from '../../database/schemas/transfer-verification.schema';
import {
  Transaction,
  TransactionDocument,
  TransactionType,
} from '../../database/schemas/transaction.schema';
import { TransferRequestDto } from './dto/transfer-request.dto';
import { TransferConfirmDto } from './dto/transfer-confirm.dto';
import { EmailService } from '../email/email.service';
import { AuditService } from '../audit/audit.service';
import transactionConfig from '../../config/transaction.config';

@Injectable()
export class TransfersService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(TransferVerification.name)
    private transferVerificationModel: Model<TransferVerificationDocument>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}

  async initiateTransfer(
    userId: string,
    transferRequestDto: TransferRequestDto,
  ) {
    const { recipientIdentifier, amount, transName } = transferRequestDto;

    // Get sender account
    const senderAccount = await this.accountModel.findById(userId);
    if (!senderAccount) {
      throw new NotFoundException('Sender account not found');
    }

    // Check if sender has sufficient balance
    const senderBalance = parseFloat(senderAccount.balance.toString());
    if (senderBalance < amount) {
      throw new ForbiddenException({
        code: 'INSUFFICIENT_FUNDS',
        message: 'Insufficient account balance',
      });
    }

    // Check per-transaction limit
    if (amount > transactionConfig().maxTransactionAmount) {
      throw new ForbiddenException({
        code: 'LIMIT_PER_TRANSACTION',
        message: `Amount exceeds per-transaction limit of ${transactionConfig().maxTransactionAmount.toLocaleString()} VND`,
      });
    }

    // Find recipient account
    const recipientAccount = await this.accountModel.findOne({
      $or: [
        { accountNumber: recipientIdentifier },
        { nickname: recipientIdentifier },
      ],
    });

    if (!recipientAccount) {
      throw new NotFoundException('Recipient account not found');
    }

    // Check if trying to transfer to self
    if ((recipientAccount as any)._id.toString() === userId) {
      throw new BadRequestException('Cannot transfer to your own account');
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration time (5 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Invalidate existing verification codes for this account
    await this.transferVerificationModel.updateMany(
      { accountId: userId, isUsed: false },
      { isUsed: true, usedAt: new Date() },
    );

    // Create transfer verification record
    const transferVerification = new this.transferVerificationModel({
      accountId: userId,
      code,
      recipientAccountNumber: recipientAccount.accountNumber,
      recipientName: recipientAccount.name,
      amount,
      transName,
      expiresAt,
    });

    await transferVerification.save();

    // Send verification email
    await this.emailService.sendTransferVerificationEmail(
      senderAccount.email,
      code,
      {
        recipientName: recipientAccount.name,
        recipientAccountNumber: recipientAccount.accountNumber,
        amount,
        transName,
      },
    );

    return {
      message: 'VERIFICATION_CODE_SENT',
      recipientName: recipientAccount.name,
      recipientAccountNumber: recipientAccount.accountNumber,
      amount,
      expiresAt,
    };
  }

  async confirmTransfer(
    userId: string,
    transferConfirmDto: TransferConfirmDto,
  ) {
    const { code } = transferConfirmDto;

    // Find valid verification record
    const verification = await this.transferVerificationModel.findOne({
      accountId: userId,
      code,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!verification) {
      throw new BadRequestException({
        code: 'INVALID_CODE',
        message: 'Invalid or expired verification code',
      });
    }

    const session: ClientSession =
      await this.transactionModel.db.startSession();

    try {
      await session.withTransaction(async () => {
        // Get sender account
        const senderAccount = await this.accountModel.findById(userId, null, {
          session,
        });
        if (!senderAccount) {
          throw new NotFoundException('Sender account not found');
        }

        // Double-check balance
        const senderBalance = parseFloat(senderAccount.balance.toString());
        if (senderBalance < verification.amount) {
          throw new ForbiddenException({
            code: 'INSUFFICIENT_FUNDS',
            message: 'Insufficient account balance',
          });
        }

        // Get recipient account
        const recipientAccount = await this.accountModel.findOne(
          { accountNumber: verification.recipientAccountNumber },
          null,
          { session },
        );
        if (!recipientAccount) {
          throw new NotFoundException('Recipient account not found');
        }

        // Create sender transaction (withdrawal)
        const senderTransaction = new this.transactionModel({
          accountId: userId,
          transName: `Transfer to ${verification.recipientName} - ${verification.transName}`,
          transMoney: Decimal128.fromString((-verification.amount).toString()),
          transType: TransactionType.WITHDRAW,
        });

        await senderTransaction.save({ session });

        // Create recipient transaction (deposit)
        const recipientTransaction = new this.transactionModel({
          accountId: recipientAccount._id,
          transName: `Transfer from ${senderAccount.name} - ${verification.transName}`,
          transMoney: Decimal128.fromString(verification.amount.toString()),
          transType: TransactionType.DEPOSIT,
        });

        await recipientTransaction.save({ session });

        // Update sender balance
        await this.accountModel.findByIdAndUpdate(
          userId,
          {
            $inc: {
              balance: Decimal128.fromString((-verification.amount).toString()),
            },
          },
          { session },
        );

        // Update recipient balance
        await this.accountModel.findByIdAndUpdate(
          recipientAccount._id,
          {
            $inc: {
              balance: Decimal128.fromString(verification.amount.toString()),
            },
          },
          { session },
        );

        // Mark verification as used
        verification.isUsed = true;
        verification.usedAt = new Date();
        await verification.save({ session });

        // Log audit for sender
        await this.auditService.log({
          actorId: userId,
          action: 'TRANSFER_SENT',
          resource: 'transaction',
          meta: {
            transactionId: (senderTransaction as any)._id.toString(),
            amount: verification.amount,
            recipientAccountNumber: verification.recipientAccountNumber,
            recipientName: verification.recipientName,
          },
        });

        // Log audit for recipient
        await this.auditService.log({
          actorId: (recipientAccount as any)._id.toString(),
          action: 'TRANSFER_RECEIVED',
          resource: 'transaction',
          meta: {
            transactionId: (recipientTransaction as any)._id.toString(),
            amount: verification.amount,
            senderAccountNumber: senderAccount.accountNumber,
            senderName: senderAccount.name,
          },
        });
      });

      return {
        message: 'TRANSFER_COMPLETED',
        amount: verification.amount,
        recipientName: verification.recipientName,
        recipientAccountNumber: verification.recipientAccountNumber,
      };
    } finally {
      await session.endSession();
    }
  }

  async getTransferHistory(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
  ) {
    const skip = (page - 1) * pageSize;

    // Get sent transfers
    const sentTransfers = await this.transactionModel
      .find({
        accountId: userId,
        transName: { $regex: /^Transfer to/ },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    // Get received transfers
    const receivedTransfers = await this.transactionModel
      .find({
        accountId: userId,
        transName: { $regex: /^Transfer from/ },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const allTransfers = [...sentTransfers, ...receivedTransfers]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, pageSize);

    const total = await this.transactionModel.countDocuments({
      accountId: userId,
      transName: { $regex: /^Transfer/ },
    });

    return {
      items: allTransfers.map((t) => ({
        ...t,
        transMoney: parseFloat(t.transMoney.toString()),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
