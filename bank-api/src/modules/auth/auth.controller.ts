import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginResponseDto, MessageResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Account } from '../../database/schemas/account.schema';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user account',
    description:
      'Creates a new user account and sends verification email. If email exists but not verified, sends new verification code.',
  })
  @ApiResponse({
    status: 201,
    description: 'Registration successful, verification email sent',
    type: MessageResponseDto,
    schema: {
      example: { success: true, data: { message: 'VERIFICATION_SENT' } },
    },
  })
  @ApiResponse({
    status: 202,
    description: 'Email exists but not verified, new verification code sent',
    type: MessageResponseDto,
    schema: {
      example: { success: true, data: { message: 'VERIFICATION_SENT' } },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists and verified',
    schema: {
      example: {
        success: false,
        code: 'EMAIL_EXISTS',
        message: 'Email already exists and is verified',
      },
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email address',
    description:
      'Verifies email address using the verification code sent to email',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: MessageResponseDto,
    schema: {
      example: { success: true, data: { message: 'VERIFIED' } },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification code',
    schema: {
      example: {
        success: false,
        code: 'INVALID_CODE',
        message: 'Invalid or expired verification code',
      },
    },
  })
  async verifyEmail(@Body() verifyDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyDto);
  }

  @Post('resend-verification')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Resend verification email',
    description: 'Resends verification email to unverified accounts',
  })
  @ApiResponse({
    status: 202,
    description: 'Verification email resent',
    type: MessageResponseDto,
    schema: {
      example: { success: true, data: { message: 'VERIFICATION_SENT' } },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found',
    schema: {
      example: {
        success: false,
        code: 'NOT_FOUND',
        message: 'Account not found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email already verified',
    schema: {
      example: {
        success: false,
        code: 'EMAIL_EXISTS',
        message: 'Email is already verified',
      },
    },
  })
  async resendVerification(@Body() resendDto: ResendVerificationDto) {
    return this.authService.resendVerification(resendDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates user and returns JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expiresIn: 900,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid credentials',
    schema: {
      example: {
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Email not verified or account locked',
    schema: {
      example: {
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email before logging in',
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change password',
    description: 'Changes user password (requires authentication)',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    type: MessageResponseDto,
    schema: {
      example: { success: true, data: { message: 'PASSWORD_CHANGED' } },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid current password',
    schema: {
      example: {
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Current password is incorrect',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    },
  })
  async changePassword(
    @CurrentUser() user: Account,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      (user as any)._id.toString(),
      changePasswordDto,
    );
  }
}
