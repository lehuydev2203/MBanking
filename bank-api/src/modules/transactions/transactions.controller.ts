import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Header,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { stringify } from 'csv-stringify';
import { TransactionsService } from './transactions.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import {
  TransactionResponseDto,
  CanWithdrawResponseDto,
} from './dto/transaction-response.dto';
import { PaginatedResponseDto } from '../../common/dto/response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Account } from '../../database/schemas/account.schema';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('can-withdraw')
  @ApiOperation({
    summary: 'Check if withdrawal is allowed',
    description:
      'Checks if a withdrawal amount is allowed based on balance, limits, and daily usage',
  })
  @ApiQuery({
    name: 'amount',
    description: 'Amount to check',
    type: Number,
    example: 1000000,
  })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal check completed',
    type: CanWithdrawResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    },
  })
  async canWithdraw(
    @CurrentUser() user: Account,
    @Query('amount') amount: number,
  ) {
    return this.transactionsService.canWithdraw(
      (user as any)._id.toString(),
      amount,
    );
  }

  @Post('deposit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Deposit money',
    description: 'Deposits money into the user account',
  })
  @ApiResponse({
    status: 201,
    description: 'Deposit successful',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      example: {
        success: false,
        code: 'BAD_REQUEST',
        message: 'Amount must be greater than 0',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    },
  })
  async deposit(@CurrentUser() user: Account, @Body() depositDto: DepositDto) {
    return this.transactionsService.deposit(
      (user as any)._id.toString(),
      depositDto,
    );
  }

  @Post('withdraw')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Withdraw money',
    description:
      'Withdraws money from the user account with balance and limit checks',
  })
  @ApiResponse({
    status: 201,
    description: 'Withdrawal successful',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      example: {
        success: false,
        code: 'BAD_REQUEST',
        message: 'Amount must be greater than 0',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Withdrawal not allowed',
    schema: {
      examples: {
        insufficientFunds: {
          summary: 'Insufficient funds',
          value: {
            success: false,
            code: 'INSUFFICIENT_FUNDS',
            message: 'Insufficient account balance',
          },
        },
        limitPerTransaction: {
          summary: 'Per-transaction limit exceeded',
          value: {
            success: false,
            code: 'LIMIT_PER_TRANSACTION',
            message: 'Amount exceeds per-transaction limit',
          },
        },
        dailyLimitExceeded: {
          summary: 'Daily limit exceeded',
          value: {
            success: false,
            code: 'DAILY_LIMIT_EXCEEDED',
            message: 'Amount would exceed daily withdrawal limit',
          },
        },
      },
    },
  })
  async withdraw(
    @CurrentUser() user: Account,
    @Body() withdrawDto: WithdrawDto,
  ) {
    return this.transactionsService.withdraw(
      (user as any)._id.toString(),
      withdrawDto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Lịch sử giao dịch',
    description:
      'Lấy danh sách tất cả giao dịch của người dùng bao gồm: nạp tiền, rút tiền, chuyển khoản đi và chuyển khoản đến. Có thể lọc theo loại giao dịch, khoảng thời gian và số tiền.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lấy lịch sử giao dịch thành công. Mỗi giao dịch sẽ có thông tin phân loại (transactionCategory và transactionTypeLabel)',
    type: PaginatedResponseDto<TransactionResponseDto>,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    },
  })
  async getTransactions(
    @CurrentUser() user: Account,
    @Query() query: TransactionQueryDto,
  ) {
    return this.transactionsService.getTransactions(
      (user as any)._id.toString(),
      query,
    );
  }

  @Get('export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="transactions.csv"')
  @ApiOperation({
    summary: 'Export transactions to CSV',
    description: 'Exports user transactions to CSV format with filters',
  })
  @ApiResponse({
    status: 200,
    description: 'CSV export successful',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    },
  })
  async exportTransactions(
    @CurrentUser() user: Account,
    @Query() query: Omit<TransactionQueryDto, 'page' | 'pageSize'>,
    @Res() res: Response,
  ) {
    const transactions = await this.transactionsService.exportTransactions(
      (user as any)._id.toString(),
      query,
    );

    // Add BOM for Excel compatibility
    const bom = '\uFEFF';

    const csvColumns = [
      'ID',
      'Account ID',
      'Transaction Name',
      'Amount (VND)',
      'Type',
      'Client Request ID',
      'Created At',
    ];

    const csvData = transactions.map((t) => [
      t.id,
      t.accountId,
      this.escapeCsvCell(t.transName),
      t.transMoney,
      t.transType === 1 ? 'Deposit' : 'Withdraw',
      t.clientRequestId || '',
      t.createdAt.toISOString(),
    ]);

    stringify([csvColumns, ...csvData], (err, output) => {
      if (err) {
        return res.status(500).json({
          success: false,
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate CSV',
        });
      }

      res.send(bom + output);
    });
  }

  private escapeCsvCell(cell: string): string {
    if (!cell) return '';

    // CSV injection protection
    const firstChar = cell.charAt(0);
    if (['+', '-', '@', '='].includes(firstChar)) {
      return `'${cell}`;
    }

    return cell;
  }
}
