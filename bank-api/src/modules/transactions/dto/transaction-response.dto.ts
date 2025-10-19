import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../../../database/schemas/transaction.schema';

export class TransactionResponseDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: string;

  @ApiProperty({ description: 'Account ID' })
  accountId: string;

  @ApiProperty({ description: 'Transaction name/description' })
  transName: string;

  @ApiProperty({ description: 'Transaction amount' })
  transMoney: number;

  @ApiProperty({ description: 'Transaction type', enum: TransactionType })
  transType: TransactionType;

  @ApiPropertyOptional({ description: 'Client request ID' })
  clientRequestId?: string;

  @ApiProperty({ description: 'Transaction creation date' })
  createdAt: Date;
}

export class CanWithdrawResponseDto {
  @ApiProperty({ description: 'Whether withdrawal is allowed' })
  allowed: boolean;

  @ApiProperty({
    description: 'Reasons why withdrawal is not allowed',
    type: [String],
  })
  reasons: string[];

  @ApiProperty({ description: 'Current account balance' })
  balance: number;

  @ApiProperty({ description: 'Amount used today (in VND timezone)' })
  dailyUsed: number;

  @ApiProperty({ description: 'Daily withdrawal limit (in VND)' })
  dailyLimit: number;
}
