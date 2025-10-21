import { ApiProperty } from '@nestjs/swagger';

export class RecipientInfoDto {
  @ApiProperty({
    description: 'Recipient identifier (account number or nickname)',
    example: '9999999999',
  })
  identifier: string;

  @ApiProperty({
    description: 'Recipient full name',
    example: 'Nguyễn Văn A',
  })
  name: string;

  @ApiProperty({
    description: 'Recipient account number',
    example: '9999999999',
  })
  accountNumber: string;

  @ApiProperty({
    description: 'Recipient nickname (if available)',
    example: 'nguyenvana',
    required: false,
  })
  nickname?: string;

  @ApiProperty({
    description: 'Whether the recipient account is verified',
    example: true,
  })
  isVerified: boolean;

  @ApiProperty({
    description: 'Whether the recipient account is active',
    example: true,
  })
  isActive: boolean;
}

export class RecipientInfoResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Recipient information',
    type: RecipientInfoDto,
  })
  data: RecipientInfoDto;

  @ApiProperty({
    description: 'Response message',
    example: 'Recipient information retrieved successfully',
  })
  message: string;
}
