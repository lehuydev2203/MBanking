import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  Account,
  AccountDocument,
} from '../../database/schemas/account.schema';
import {
  EmailVerification,
  EmailVerificationDocument,
} from '../../database/schemas/email-verification.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { EmailService } from '../email/email.service';
import { AuditService } from '../audit/audit.service';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(EmailVerification.name)
    private emailVerificationModel: Model<EmailVerificationDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private auditService: AuditService,
    private accountsService: AccountsService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, phone, password } = registerDto;

    // Check if email already exists
    const existingAccount = await this.accountModel.findOne({ email });

    if (existingAccount) {
      if (existingAccount.isEmailVerified) {
        throw new ConflictException({
          code: 'EMAIL_EXISTS',
          message: 'Email already exists and is verified',
        });
      } else {
        // Email exists but not verified, create new verification code
        await this.createAndSendVerificationCode(existingAccount._id, email);
        return { message: 'VERIFICATION_SENT' };
      }
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate account number
    const accountNumber = await this.accountsService.generateAccountNumber();

    // Create new account
    const account = new this.accountModel({
      name,
      email,
      phone,
      passwordHash,
      accountNumber,
    });

    await account.save();

    // Create and send verification code
    await this.createAndSendVerificationCode(account._id, email);

    return { message: 'VERIFICATION_SENT' };
  }

  async verifyEmail(verifyDto: VerifyEmailDto) {
    const { code } = verifyDto;

    const verification = await this.emailVerificationModel.findOne({
      code,
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });

    if (!verification) {
      throw new BadRequestException({
        code: 'INVALID_CODE',
        message: 'Invalid or expired verification code',
      });
    }

    // Update account verification status
    await this.accountModel.findByIdAndUpdate(verification.accountId, {
      isEmailVerified: true,
      verifiedAt: new Date(),
    });

    // Mark verification as used
    verification.usedAt = new Date();
    await verification.save();

    return { message: 'VERIFIED' };
  }

  async resendVerification(resendDto: ResendVerificationDto) {
    const { email } = resendDto;

    const account = await this.accountModel.findOne({ email });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.isEmailVerified) {
      throw new ConflictException({
        code: 'EMAIL_EXISTS',
        message: 'Email is already verified',
      });
    }

    await this.createAndSendVerificationCode(account._id, email);

    return { message: 'VERIFICATION_SENT' };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const account = await this.accountModel
      .findOne({ email })
      .select('+passwordHash');

    if (!account) {
      throw new BadRequestException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    if (account.status !== 'active') {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Account is locked',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      account.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    if (!account.isEmailVerified) {
      throw new ForbiddenException({
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email before logging in',
      });
    }

    const payload = {
      sub: (account as any)._id.toString(),
      email: account.email,
      role: account.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      expiresIn: 900, // 15 minutes
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const account = await this.accountModel
      .findById(userId)
      .select('+passwordHash');

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      account.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException({
        code: 'INVALID_CREDENTIALS',
        message: 'Current password is incorrect',
      });
    }

    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    account.passwordHash = newPasswordHash;
    await account.save();

    // Log audit
    await this.auditService.log({
      actorId: userId,
      action: 'CHANGE_PASSWORD',
      resource: 'account',
      meta: { accountId: userId },
    });

    return { message: 'PASSWORD_CHANGED' };
  }

  async validateUserById(userId: string) {
    return this.accountModel.findById(userId);
  }

  private async createAndSendVerificationCode(accountId: any, email: string) {
    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration time (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Invalidate existing verification codes for this account
    await this.emailVerificationModel.updateMany(
      { accountId },
      { usedAt: new Date() },
    );

    // Create new verification record
    const verification = new this.emailVerificationModel({
      accountId,
      code,
      expiresAt,
    });

    await verification.save();

    // Send verification email
    await this.emailService.sendVerificationEmail(email, code);
  }
}
