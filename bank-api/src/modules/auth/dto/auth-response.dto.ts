import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 900,
  })
  expiresIn: number;
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'VERIFICATION_SENT',
  })
  message: string;
}
