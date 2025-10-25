import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Account,
  AccountDocument,
} from '../../database/schemas/account.schema';
import {
  Transaction,
  TransactionDocument,
} from '../../database/schemas/transaction.schema';
import { AdminUserQueryDto } from './dto/admin-user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminTransactionQueryDto } from './dto/admin-transaction-query.dto';
import { AuditService } from '../audit/audit.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private auditService: AuditService,
    private authService: AuthService,
  ) {}

  async getUsers(query: AdminUserQueryDto, currentUserId: string) {
    const {
      page = 1,
      pageSize = 10,
      q,
      role,
      status,
      emailVerified,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: any = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { accountNumber: { $regex: q, $options: 'i' } },
        { nickname: { $regex: q, $options: 'i' } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    if (emailVerified !== undefined && emailVerified !== '') {
      filter.isEmailVerified = emailVerified === 'true';
    }

    const skip = (page - 1) * pageSize;
    const total = await this.accountModel.countDocuments(filter);

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await this.accountModel
      .find(filter)
      .select('-passwordHash')
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .lean();

    return {
      items: users.map((user) => ({
        ...user,
        balance: parseFloat(user.balance.toString()),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    currentUserId: string,
  ) {
    const user = await this.accountModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent self-demotion
    if (userId === currentUserId && updateUserDto.role) {
      const currentUser = await this.accountModel.findById(currentUserId);
      if (
        currentUser?.role === 'superadmin' &&
        updateUserDto.role !== 'superadmin'
      ) {
        throw new ForbiddenException({
          code: 'FORBIDDEN',
          message: 'Cannot demote yourself from superadmin role',
        });
      }
    }

    const updatedUser = await this.accountModel
      .findByIdAndUpdate(userId, updateUserDto, {
        new: true,
        runValidators: true,
      })
      .select('-passwordHash');

    // Log audit
    await this.auditService.log({
      actorId: currentUserId,
      action: 'UPDATE_USER',
      resource: 'user',
      meta: {
        targetUserId: userId,
        updatedFields: Object.keys(updateUserDto),
        newValues: updateUserDto,
      },
    });

    return {
      ...updatedUser!.toJSON(),
      balance: parseFloat(updatedUser!.balance.toString()),
    };
  }

  async resendUserVerification(userId: string, currentUserId: string) {
    const user = await this.accountModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException({
        code: 'BAD_REQUEST',
        message: 'User email is already verified',
      });
    }

    // Use auth service to resend verification
    await this.authService.resendVerification({ email: user.email });

    // Log audit
    await this.auditService.log({
      actorId: currentUserId,
      action: 'RESEND_VERIFICATION',
      resource: 'user',
      meta: { targetUserId: userId, email: user.email },
    });

    return { message: 'VERIFICATION_SENT' };
  }

  async getTransactions(query: AdminTransactionQueryDto) {
    const {
      page = 1,
      pageSize = 10,
      type,
      accountId,
      from,
      to,
      min,
      max,
    } = query;

    const filter: any = {};

    if (type !== undefined) {
      filter.transType = type;
    }

    if (accountId) {
      filter.accountId = accountId;
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    if (min !== undefined || max !== undefined) {
      filter.transMoney = {};
      if (min !== undefined) filter.transMoney.$gte = min;
      if (max !== undefined) filter.transMoney.$lte = max;
    }

    const skip = (page - 1) * pageSize;
    const total = await this.transactionModel.countDocuments(filter);

    const transactions = await this.transactionModel
      .find(filter)
      .populate('accountId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    return {
      items: transactions.map((t) => ({
        ...t,
        transMoney: parseFloat(t.transMoney.toString()),
        account: t.accountId,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async resendUserVerificationByEmail(email: string, currentUserId: string) {
    const user = await this.accountModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException({
        code: 'BAD_REQUEST',
        message: 'User email is already verified',
      });
    }

    // Use auth service to resend verification
    await this.authService.resendVerification({ email: user.email });

    // Log audit
    await this.auditService.log({
      actorId: currentUserId,
      action: 'RESEND_VERIFICATION',
      resource: 'user',
      meta: { targetUserId: (user as any)._id.toString(), email: user.email },
    });

    return { message: 'VERIFICATION_SENT' };
  }

  async updateUserByAccountNumber(
    accountNumber: string,
    updateUserDto: UpdateUserDto,
    currentUserId: string,
  ) {
    const user = await this.accountModel.findOne({ accountNumber });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent self-demotion
    if ((user as any)._id.toString() === currentUserId && updateUserDto.role) {
      const currentUser = await this.accountModel.findById(currentUserId);
      if (
        currentUser?.role === 'superadmin' &&
        updateUserDto.role !== 'superadmin'
      ) {
        throw new ForbiddenException({
          code: 'FORBIDDEN',
          message: 'Cannot demote yourself from superadmin role',
        });
      }
    }

    const updatedUser = await this.accountModel
      .findOneAndUpdate({ accountNumber }, updateUserDto, {
        new: true,
        runValidators: true,
      })
      .select('-passwordHash');

    // Log audit
    await this.auditService.log({
      actorId: currentUserId,
      action: 'UPDATE_USER',
      resource: 'user',
      meta: {
        targetUserId: (user as any)._id.toString(),
        updatedFields: Object.keys(updateUserDto),
        newValues: updateUserDto,
      },
    });

    return {
      ...updatedUser!.toJSON(),
      balance: parseFloat(updatedUser!.balance.toString()),
    };
  }
}
