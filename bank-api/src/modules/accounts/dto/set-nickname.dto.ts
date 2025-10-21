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
      'Nickname for the account (3-20 characters, letters, numbers, and underscores only)',
    example: 'john_doe',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Nickname must contain only letters, numbers, and underscores',
  })
  nickname: string;
}
