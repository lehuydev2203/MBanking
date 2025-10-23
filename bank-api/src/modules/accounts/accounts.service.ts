import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Account,
  AccountDocument,
} from '../../database/schemas/account.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuditService } from '../audit/audit.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    private auditService: AuditService,
    private emailService: EmailService,
  ) {}

  async getProfile(userId: string) {
    const account = await this.accountModel.findById(userId);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Return only the necessary data, not the full Mongoose document
    return {
      id: (account as any)._id.toString(),
      name: account.name,
      email: account.email,
      accountNumber: account.accountNumber,
      nickname: account.nickname,
      status: account.status,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const account = await this.accountModel.findById(userId);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const updatedAccount = await this.accountModel.findByIdAndUpdate(
      userId,
      updateProfileDto,
      { new: true, runValidators: true },
    );

    // Log audit
    await this.auditService.log({
      actorId: userId,
      action: 'UPDATE_PROFILE',
      resource: 'account',
      meta: { accountId: userId, updatedFields: Object.keys(updateProfileDto) },
    });

    return updatedAccount;
  }

  async getBalance(userId: string) {
    const account = await this.accountModel.findById(userId).select('balance');

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return { balance: parseFloat(account.balance.toString()) };
  }

  async generateAccountNumber(): Promise<string> {
    let accountNumber: string = '';
    let isUnique = false;

    while (!isUnique) {
      // Generate account number with format: YYMMDDHHmmss + 4 random digits
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2); // YY
      const month = (now.getMonth() + 1).toString().padStart(2, '0'); // MM
      const day = now.getDate().toString().padStart(2, '0'); // DD
      const hour = now.getHours().toString().padStart(2, '0'); // HH
      const minute = now.getMinutes().toString().padStart(2, '0'); // mm
      const second = now.getSeconds().toString().padStart(2, '0'); // ss

      // Generate 4 random digits
      const randomDigits = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');

      // Combine: YYMMDDHHmmss + 4 random digits = 16 digits total
      accountNumber =
        year + month + day + hour + minute + second + randomDigits;

      const existingAccount = await this.accountModel.findOne({
        accountNumber,
      });
      if (!existingAccount) {
        isUnique = true;
      }
    }

    return accountNumber;
  }

  async setNickname(userId: string, nickname: string) {
    const account = await this.accountModel.findById(userId);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Check if account already has a nickname
    if (account.nickname) {
      throw new BadRequestException({
        code: 'NICKNAME_ALREADY_SET',
        message: 'Nickname can only be set once and cannot be changed',
      });
    }

    // Check if nickname is already taken by another account
    const existingAccount = await this.accountModel.findOne({
      nickname,
      _id: { $ne: userId },
    });

    if (existingAccount) {
      throw new BadRequestException({
        code: 'NICKNAME_TAKEN',
        message: 'Nickname is already taken by another account',
      });
    }

    // Validate nickname format
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(nickname)) {
      throw new BadRequestException({
        code: 'INVALID_NICKNAME_FORMAT',
        message:
          'Nickname must be 3-20 characters long and contain only letters, numbers, and underscores',
      });
    }

    const updatedAccount = await this.accountModel.findByIdAndUpdate(
      userId,
      { nickname },
      { new: true, runValidators: true },
    );

    // Log audit
    await this.auditService.log({
      actorId: userId,
      action: 'SET_NICKNAME',
      resource: 'account',
      meta: { accountId: userId, nickname },
    });

    // Send email notification
    await this.emailService.sendNicknameCreatedEmail(account.email, {
      name: account.name,
      nickname,
      accountNumber: account.accountNumber,
    });

    return updatedAccount;
  }

  async findByAccountNumberOrNickname(identifier: string) {
    const account = await this.accountModel.findOne({
      $or: [{ accountNumber: identifier }, { nickname: identifier }],
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async getRecipientInfo(currentUserId: string, identifier: string) {
    // Validate identifier format
    const isAccountNumber = /^\d{16}$/.test(identifier);
    const isNickname = /^[a-zA-Z0-9_]{3,20}$/.test(identifier);

    if (!isAccountNumber && !isNickname) {
      throw new BadRequestException(
        'Invalid identifier format. Must be 16-digit account number or 3-20 character nickname',
      );
    }

    // Find recipient account
    const recipientAccount = await this.accountModel.findOne({
      $or: [{ accountNumber: identifier }, { nickname: identifier }],
    });

    if (!recipientAccount) {
      throw new NotFoundException('Recipient not found');
    }

    // Check if trying to transfer to self
    if ((recipientAccount as any)._id.toString() === currentUserId) {
      throw new BadRequestException('Cannot transfer to your own account');
    }

    // Check if recipient account is active
    if (recipientAccount.status !== 'active') {
      throw new BadRequestException('Recipient account is not active');
    }

    // Return recipient info (without sensitive data)
    return {
      success: true,
      data: {
        identifier,
        name: recipientAccount.name,
        accountNumber: recipientAccount.accountNumber,
        nickname: recipientAccount.nickname,
        isVerified: recipientAccount.isEmailVerified,
        isActive: recipientAccount.status === 'active',
      },
      message: 'Recipient information retrieved successfully',
    };
  }
}
