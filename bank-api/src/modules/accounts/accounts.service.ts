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

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    private auditService: AuditService,
  ) {}

  async getProfile(userId: string) {
    const account = await this.accountModel.findById(userId);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
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
      // Generate 10-digit account number starting with 1
      accountNumber = '1' + Math.random().toString().substr(2, 9);

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

    // Check if nickname is already taken
    const existingAccount = await this.accountModel.findOne({
      nickname,
      _id: { $ne: userId },
    });

    if (existingAccount) {
      throw new BadRequestException('Nickname already taken');
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
}
