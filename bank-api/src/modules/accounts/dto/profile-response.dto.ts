import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({ description: 'Account ID' })
  id: string;

  @ApiProperty({ description: 'Full name' })
  name: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  phone?: string;

  @ApiProperty({
    description: 'User role',
    enum: ['user', 'admin', 'superadmin'],
  })
  role: string;

  @ApiProperty({ description: 'Account status', enum: ['active', 'locked'] })
  status: string;

  @ApiProperty({ description: 'Email verification status' })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Email verification date' })
  verifiedAt?: Date;
}

export class BalanceResponseDto {
  @ApiProperty({ description: 'Account balance', example: 1000000 })
  balance: number;
}
