import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'Nguyễn Văn A',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+84901234567',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(\+84|84|0)[1-9][0-9]{8,9}$/, {
    message: 'Please provide a valid Vietnamese phone number',
  })
  phone?: string;

  @ApiProperty({
    description: 'Password (minimum 8 characters)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;
}
