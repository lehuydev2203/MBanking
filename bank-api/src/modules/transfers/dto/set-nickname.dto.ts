import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetNicknameDto {
  @ApiProperty({
    description:
      'Biệt danh cho tài khoản. Chỉ được sử dụng chữ cái, số và dấu gạch dưới. Dùng để người khác có thể chuyển tiền cho bạn dễ dàng hơn',
    example: 'john_doe',
    minLength: 3,
    maxLength: 20,
    pattern: '^[a-zA-Z0-9_]+$',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Nickname chỉ được chứa chữ cái, số và dấu gạch dưới',
  })
  nickname: string;
}
