import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferRequestDto {
  @ApiProperty({
    description:
      'Số tài khoản (10 chữ số) hoặc nickname (3-20 ký tự) của người nhận',
    example: '1234567890',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  recipientIdentifier: string;

  @ApiProperty({
    description:
      'Số tiền chuyển khoản (VND). Tối thiểu 1,000 VND, tối đa 20,000,000 VND mỗi giao dịch',
    example: 100000,
    minimum: 1000,
    maximum: 20000000,
  })
  @IsNumber()
  @Min(1000)
  amount: number;

  @ApiProperty({
    description:
      'Nội dung chuyển khoản. Mô tả ngắn gọn về mục đích chuyển tiền',
    example: 'Thanh toán dịch vụ',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  transName: string;
}
