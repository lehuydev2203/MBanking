import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { EmailService } from '../../email/email.service';
import { AuditService } from '../../audit/audit.service';
import { Account } from '../../../database/schemas/account.schema';
import { EmailVerification } from '../../../database/schemas/email-verification.schema';

describe('AuthService', () => {
  let service: AuthService;
  let mockAccountModel: any;
  let mockEmailVerificationModel: any;
  let mockJwtService: any;
  let mockEmailService: any;
  let mockAuditService: any;

  beforeEach(async () => {
    mockAccountModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      save: jest.fn(),
    };

    mockEmailVerificationModel = {
      findOne: jest.fn(),
      updateMany: jest.fn(),
      save: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    mockEmailService = {
      sendVerificationEmail: jest.fn(),
    };

    mockAuditService = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(Account.name),
          useValue: mockAccountModel,
        },
        {
          provide: getModelToken(EmailVerification.name),
          useValue: mockEmailVerificationModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+84901234567',
        password: 'TestPass123!',
      };

      mockAccountModel.findOne.mockResolvedValue(null);
      mockAccountModel.save.mockResolvedValue({
        _id: 'account-id',
        ...registerDto,
        passwordHash: 'hashed-password',
      });
      mockEmailVerificationModel.updateMany.mockResolvedValue({});
      mockEmailVerificationModel.save.mockResolvedValue({});
      mockEmailService.sendVerificationEmail.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result).toEqual({ message: 'VERIFICATION_SENT' });
      expect(mockAccountModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(mockAccountModel.save).toHaveBeenCalled();
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists and verified', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123!',
      };

      mockAccountModel.findOne.mockResolvedValue({
        email: 'test@example.com',
        isEmailVerified: true,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should resend verification if email exists but not verified', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123!',
      };

      mockAccountModel.findOne.mockResolvedValue({
        _id: 'account-id',
        email: 'test@example.com',
        isEmailVerified: false,
      });
      mockEmailVerificationModel.updateMany.mockResolvedValue({});
      mockEmailVerificationModel.save.mockResolvedValue({});
      mockEmailService.sendVerificationEmail.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result).toEqual({ message: 'VERIFICATION_SENT' });
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const verifyDto = { code: '123456' };

      mockEmailVerificationModel.findOne.mockResolvedValue({
        accountId: 'account-id',
        code: '123456',
        expiresAt: new Date(Date.now() + 60000),
        usedAt: null,
      });
      mockAccountModel.findByIdAndUpdate.mockResolvedValue({});
      mockEmailVerificationModel.save.mockResolvedValue({});

      const result = await service.verifyEmail(verifyDto);

      expect(result).toEqual({ message: 'VERIFIED' });
      expect(mockAccountModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'account-id',
        expect.objectContaining({
          isEmailVerified: true,
          verifiedAt: expect.any(Date),
        }),
      );
    });

    it('should throw BadRequestException for invalid code', async () => {
      const verifyDto = { code: 'invalid' };

      mockEmailVerificationModel.findOne.mockResolvedValue(null);

      await expect(service.verifyEmail(verifyDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for expired code', async () => {
      const verifyDto = { code: '123456' };

      mockEmailVerificationModel.findOne.mockResolvedValue({
        accountId: 'account-id',
        code: '123456',
        expiresAt: new Date(Date.now() - 60000), // Expired
        usedAt: null,
      });

      await expect(service.verifyEmail(verifyDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'TestPass123!',
      };

      const mockAccount = {
        _id: 'account-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        status: 'active',
        isEmailVerified: true,
        role: 'user',
      };

      mockAccountModel.findOne.mockResolvedValue(mockAccount);
      mockJwtService.sign.mockReturnValue('jwt-token');

      // Mock bcrypt.compare
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: 'jwt-token',
        expiresIn: 900,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'account-id',
        email: 'test@example.com',
        role: 'user',
      });
    });

    it('should throw BadRequestException for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      mockAccountModel.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException for unverified email', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'TestPass123!',
      };

      const mockAccount = {
        _id: 'account-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        status: 'active',
        isEmailVerified: false,
      };

      mockAccountModel.findOne.mockResolvedValue(mockAccount);

      // Mock bcrypt.compare
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const changePasswordDto = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
      };

      const mockAccount = {
        _id: 'account-id',
        passwordHash: 'old-hashed-password',
        save: jest.fn().mockResolvedValue({}),
      };

      mockAccountModel.findById.mockResolvedValue(mockAccount);
      mockAuditService.log.mockResolvedValue({});

      // Mock bcrypt.compare and bcrypt.hash
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-hashed-password');

      const result = await service.changePassword(
        'account-id',
        changePasswordDto,
      );

      expect(result).toEqual({ message: 'PASSWORD_CHANGED' });
      expect(mockAccount.passwordHash).toBe('new-hashed-password');
      expect(mockAccount.save).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw BadRequestException for incorrect current password', async () => {
      const changePasswordDto = {
        currentPassword: 'WrongPass123!',
        newPassword: 'NewPass123!',
      };

      const mockAccount = {
        _id: 'account-id',
        passwordHash: 'old-hashed-password',
      };

      mockAccountModel.findById.mockResolvedValue(mockAccount);

      // Mock bcrypt.compare
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        service.changePassword('account-id', changePasswordDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
