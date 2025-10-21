import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role, Status } from '../../../database/schemas/account.schema';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class AdminUserQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search query for name, email, account number, or nickname',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Filter by role',
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: Status,
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
