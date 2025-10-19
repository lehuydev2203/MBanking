import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsPositive,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../../../database/schemas/transaction.schema';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class TransactionQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Transaction type filter',
    enum: TransactionType,
    example: TransactionType.DEPOSIT,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  @Type(() => Number)
  type?: TransactionType;

  @ApiPropertyOptional({
    description: 'Start date filter (ISO string)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'End date filter (ISO string)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    description: 'Minimum amount filter',
    example: 100000,
    minimum: 0.01,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  min?: number;

  @ApiPropertyOptional({
    description: 'Maximum amount filter',
    example: 5000000,
    minimum: 0.01,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  max?: number;
}
