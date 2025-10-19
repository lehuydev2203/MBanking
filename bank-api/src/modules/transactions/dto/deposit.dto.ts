import { IsPositive, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({
    description: 'Amount to deposit (must be greater than 0)',
    example: 1000000,
    minimum: 0.01,
  })
  @Type(() => Number)
  @IsPositive({ message: 'Amount must be greater than 0' })
  amount: number;

  @ApiPropertyOptional({
    description: 'Transaction description/name',
    example: 'Salary deposit',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  transName?: string;

  @ApiPropertyOptional({
    description: 'Client request ID for idempotency',
    example: 'deposit-123-456',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  clientRequestId?: string;
}
