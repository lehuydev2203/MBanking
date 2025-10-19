import { ApiProperty } from '@nestjs/swagger';

export class TransferInitiateResponseDto {
  @ApiProperty({
    description: 'Thông báo trạng thái',
    example: 'VERIFICATION_CODE_SENT',
  })
  message: string;

  @ApiProperty({
    description: 'Tên người nhận',
    example: 'Nguyễn Văn A',
  })
  recipientName: string;

  @ApiProperty({
    description: 'Số tài khoản người nhận',
    example: '1234567890',
  })
  recipientAccountNumber: string;

  @ApiProperty({
    description: 'Số tiền chuyển khoản',
    example: 100000,
  })
  amount: number;

  @ApiProperty({
    description: 'Thời gian hết hạn của mã xác nhận',
    example: '2024-01-01T12:05:00.000Z',
  })
  expiresAt: Date;
}

export class TransferConfirmResponseDto {
  @ApiProperty({
    description: 'Thông báo trạng thái',
    example: 'TRANSFER_COMPLETED',
  })
  message: string;

  @ApiProperty({
    description: 'Số tiền đã chuyển',
    example: 100000,
  })
  amount: number;

  @ApiProperty({
    description: 'Tên người nhận',
    example: 'Nguyễn Văn A',
  })
  recipientName: string;

  @ApiProperty({
    description: 'Số tài khoản người nhận',
    example: '1234567890',
  })
  recipientAccountNumber: string;
}
