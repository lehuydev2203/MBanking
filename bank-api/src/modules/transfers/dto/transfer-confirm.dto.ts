import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferConfirmDto {
  @ApiProperty({
    description:
      'Mã xác nhận 6 chữ số được gửi qua email. Mã có hiệu lực trong 5 phút',
    example: '123456',
    minLength: 6,
    maxLength: 6,
    pattern: '^[0-9]{6}$',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}
