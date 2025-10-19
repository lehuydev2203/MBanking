import { IsOptional, IsString, MinLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Full name',
    example: 'Nguyễn Văn B',
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

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
}
