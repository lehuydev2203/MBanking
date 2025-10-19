import { IsPositive, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WithdrawDto {
  @ApiProperty({
    description: 'Amount to withdraw (must be greater than 0)',
    example: 500000,
    minimum: 0.01,
  })
  @Type(() => Number)
  @IsPositive({ message: 'Amount must be greater than 0' })
  amount: number;

  @ApiPropertyOptional({
    description: 'Transaction description/name',
    example: 'ATM withdrawal',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  transName?: string;

  @ApiPropertyOptional({
    description: 'Client request ID for idempotency',
    example: 'withdraw-123-456',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  clientRequestId?: string;
}
