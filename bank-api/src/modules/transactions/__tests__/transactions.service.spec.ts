import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { TransactionsService } from '../transactions.service';
import { AuditService } from '../../audit/audit.service';
import { Transaction } from '../../../database/schemas/transaction.schema';
import { Account } from '../../../database/schemas/account.schema';
import { TransactionType } from '../../../database/schemas/transaction.schema';
import { Decimal128 } from 'mongodb';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let mockTransactionModel: any;
  let mockAccountModel: any;
  let mockAuditService: any;

  beforeEach(async () => {
    mockTransactionModel = {
      findOne: jest.fn(),
      countDocuments: jest.fn(),
      find: jest.fn(),
      aggregate: jest.fn(),
      db: {
        startSession: jest.fn().mockResolvedValue({
          withTransaction: jest.fn(),
          endSession: jest.fn(),
        }),
      },
      save: jest.fn(),
    };

    mockAccountModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    mockAuditService = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getModelToken(Transaction.name),
          useValue: mockTransactionModel,
        },
        {
          provide: getModelToken(Account.name),
          useValue: mockAccountModel,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('canWithdraw', () => {
    it('should allow withdrawal when all conditions are met', async () => {
      const userId = 'user-id';
      const amount = 1000000;

      mockAccountModel.findById.mockResolvedValue({
        balance: Decimal128.fromString('5000000'),
      });

      mockTransactionModel.aggregate.mockResolvedValue([
        { total: Decimal128.fromString('1000000') },
      ]);

      const result = await service.canWithdraw(userId, amount);

      expect(result.allowed).toBe(true);
      expect(result.reasons).toEqual([]);
      expect(result.balance).toBe(5000000);
      expect(result.dailyUsed).toBe(1000000);
    });

    it('should reject withdrawal due to insufficient balance', async () => {
      const userId = 'user-id';
      const amount = 10000000;

      mockAccountModel.findById.mockResolvedValue({
        balance: Decimal128.fromString('1000000'),
      });

      const result = await service.canWithdraw(userId, amount);

      expect(result.allowed).toBe(false);
      expect(result.reasons).toContain('Insufficient account balance');
    });

    it('should reject withdrawal due to per-transaction limit', async () => {
      const userId = 'user-id';
      const amount = 25000000; // Exceeds 20M limit

      mockAccountModel.findById.mockResolvedValue({
        balance: Decimal128.fromString('50000000'),
      });

      const result = await service.canWithdraw(userId, amount);

      expect(result.allowed).toBe(false);
      expect(
        result.reasons.some((r) => r.includes('per-transaction limit')),
      ).toBe(true);
    });

    it('should reject withdrawal due to daily limit', async () => {
      const userId = 'user-id';
      const amount = 10000000;

      mockAccountModel.findById.mockResolvedValue({
        balance: Decimal128.fromString('50000000'),
      });

      mockTransactionModel.aggregate.mockResolvedValue([
        { total: Decimal128.fromString('490000000') }, // Close to 500M limit
      ]);

      const result = await service.canWithdraw(userId, amount);

      expect(result.allowed).toBe(false);
      expect(
        result.reasons.some((r) => r.includes('daily withdrawal limit')),
      ).toBe(true);
    });
  });

  describe('deposit', () => {
    it('should deposit successfully', async () => {
      const userId = 'user-id';
      const depositDto = {
        amount: 1000000,
        transName: 'Test Deposit',
        clientRequestId: 'deposit-123',
      };

      const mockTransaction = {
        _id: 'transaction-id',
        accountId: userId,
        transName: 'Test Deposit',
        transMoney: Decimal128.fromString('1000000'),
        transType: TransactionType.DEPOSIT,
        clientRequestId: 'deposit-123',
        toJSON: jest.fn().mockReturnValue({
          _id: 'transaction-id',
          accountId: userId,
          transName: 'Test Deposit',
          transMoney: Decimal128.fromString('1000000'),
          transType: TransactionType.DEPOSIT,
          clientRequestId: 'deposit-123',
        }),
      };

      mockTransactionModel.findOne.mockResolvedValue(null);
      mockTransactionModel.db.startSession.mockResolvedValue({
        withTransaction: jest.fn().mockImplementation(async (callback) => {
          await callback();
        }),
        endSession: jest.fn(),
      });
      mockTransactionModel.save.mockResolvedValue(mockTransaction);
      mockAccountModel.findByIdAndUpdate.mockResolvedValue({});
      mockAuditService.log.mockResolvedValue({});

      const result = await service.deposit(userId, depositDto);

      expect(result).toBeDefined();
      expect(mockTransactionModel.save).toHaveBeenCalled();
      expect(mockAccountModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should return idempotent result for duplicate clientRequestId', async () => {
      const userId = 'user-id';
      const depositDto = {
        amount: 1000000,
        transName: 'Test Deposit',
        clientRequestId: 'deposit-123',
      };

      const existingTransaction = {
        _id: 'existing-transaction-id',
        accountId: userId,
        transName: 'Test Deposit',
        transMoney: Decimal128.fromString('1000000'),
        transType: TransactionType.DEPOSIT,
        clientRequestId: 'deposit-123',
        toJSON: jest.fn().mockReturnValue({
          _id: 'existing-transaction-id',
          accountId: userId,
          transName: 'Test Deposit',
          transMoney: Decimal128.fromString('1000000'),
          transType: TransactionType.DEPOSIT,
          clientRequestId: 'deposit-123',
        }),
      };

      mockTransactionModel.findOne.mockResolvedValue(existingTransaction);

      const result = await service.deposit(userId, depositDto);

      expect(result).toEqual({
        ...existingTransaction.toJSON(),
        code: 'IDEMPOTENT_REPLAY',
      });
    });
  });

  describe('withdraw', () => {
    it('should withdraw successfully when conditions are met', async () => {
      const userId = 'user-id';
      const withdrawDto = {
        amount: 1000000,
        transName: 'Test Withdrawal',
        clientRequestId: 'withdraw-123',
      };

      const mockTransaction = {
        _id: 'transaction-id',
        accountId: userId,
        transName: 'Test Withdrawal',
        transMoney: Decimal128.fromString('1000000'),
        transType: TransactionType.WITHDRAW,
        clientRequestId: 'withdraw-123',
        toJSON: jest.fn().mockReturnValue({
          _id: 'transaction-id',
          accountId: userId,
          transName: 'Test Withdrawal',
          transMoney: Decimal128.fromString('1000000'),
          transType: TransactionType.WITHDRAW,
          clientRequestId: 'withdraw-123',
        }),
      };

      // Mock canWithdraw to return allowed
      jest.spyOn(service, 'canWithdraw').mockResolvedValue({
        allowed: true,
        reasons: [],
        balance: 5000000,
        dailyUsed: 1000000,
        dailyLimit: 500000000,
      });

      mockTransactionModel.findOne.mockResolvedValue(null);
      mockTransactionModel.db.startSession.mockResolvedValue({
        withTransaction: jest.fn().mockImplementation(async (callback) => {
          await callback();
        }),
        endSession: jest.fn(),
      });
      mockAccountModel.findById.mockResolvedValue({
        balance: Decimal128.fromString('5000000'),
      });
      mockTransactionModel.save.mockResolvedValue(mockTransaction);
      mockAccountModel.findByIdAndUpdate.mockResolvedValue({});
      mockAuditService.log.mockResolvedValue({});

      const result = await service.withdraw(userId, withdrawDto);

      expect(result).toBeDefined();
      expect(mockTransactionModel.save).toHaveBeenCalled();
      expect(mockAccountModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw ForbiddenException for insufficient funds', async () => {
      const userId = 'user-id';
      const withdrawDto = {
        amount: 10000000,
        transName: 'Test Withdrawal',
      };

      jest.spyOn(service, 'canWithdraw').mockResolvedValue({
        allowed: false,
        reasons: ['Insufficient account balance'],
        balance: 1000000,
        dailyUsed: 0,
        dailyLimit: 500000000,
      });

      await expect(service.withdraw(userId, withdrawDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException for per-transaction limit exceeded', async () => {
      const userId = 'user-id';
      const withdrawDto = {
        amount: 25000000,
        transName: 'Test Withdrawal',
      };

      jest.spyOn(service, 'canWithdraw').mockResolvedValue({
        allowed: false,
        reasons: ['Amount exceeds per-transaction limit of 20,000,000 VND'],
        balance: 50000000,
        dailyUsed: 0,
        dailyLimit: 500000000,
      });

      await expect(service.withdraw(userId, withdrawDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException for daily limit exceeded', async () => {
      const userId = 'user-id';
      const withdrawDto = {
        amount: 10000000,
        transName: 'Test Withdrawal',
      };

      jest.spyOn(service, 'canWithdraw').mockResolvedValue({
        allowed: false,
        reasons: [
          'Amount would exceed daily withdrawal limit of 500,000,000 VND',
        ],
        balance: 50000000,
        dailyUsed: 490000000,
        dailyLimit: 500000000,
      });

      await expect(service.withdraw(userId, withdrawDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getTransactions', () => {
    it('should return paginated transactions', async () => {
      const userId = 'user-id';
      const query = {
        page: 1,
        pageSize: 10,
        type: TransactionType.DEPOSIT,
      };

      const mockTransactions = [
        {
          _id: 'transaction-1',
          accountId: userId,
          transName: 'Deposit 1',
          transMoney: Decimal128.fromString('1000000'),
          transType: TransactionType.DEPOSIT,
          createdAt: new Date(),
        },
        {
          _id: 'transaction-2',
          accountId: userId,
          transName: 'Deposit 2',
          transMoney: Decimal128.fromString('2000000'),
          transType: TransactionType.DEPOSIT,
          createdAt: new Date(),
        },
      ];

      mockTransactionModel.countDocuments.mockResolvedValue(2);
      mockTransactionModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockTransactions),
          }),
        }),
      });

      const result = await service.getTransactions(userId, query);

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(result.items[0].transMoney).toBe(1000000);
    });
  });
});
