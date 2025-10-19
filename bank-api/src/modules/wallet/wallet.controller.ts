import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TransactionsService } from '../transactions/transactions.service';
import { CanWithdrawResponseDto } from '../transactions/dto/transaction-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Account } from '../../database/schemas/account.schema';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
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
}
