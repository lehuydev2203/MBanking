import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role, Status } from '../../../database/schemas/account.schema';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User role',
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    description: 'User status',
    enum: Status,
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
