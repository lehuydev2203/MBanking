import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  ProfileResponseDto,
  BalanceResponseDto,
} from './dto/profile-response.dto';
import { RecipientInfoResponseDto } from './dto/recipient-info.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Account } from '../../database/schemas/account.schema';
import { SetNicknameDto } from './dto/set-nickname.dto';

@ApiTags('Me')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get user profile',
    description:
      'Returns the current user profile information including account number and nickname',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: ProfileResponseDto,
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
  async getProfile(@CurrentUser() user: Account) {
    return this.accountsService.getProfile((user as any)._id.toString());
  }

  @Patch()
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Updates the current user profile information (name, phone)',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      example: {
        success: false,
        code: 'BAD_REQUEST',
        message: 'Validation failed',
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
  async updateProfile(
    @CurrentUser() user: Account,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.accountsService.updateProfile(
      (user as any)._id.toString(),
      updateProfileDto,
    );
  }

  @Post('nickname')
  @ApiOperation({
    summary: 'Set account nickname',
    description: 'Sets a nickname for the account to be used in transfers',
  })
  @ApiResponse({
    status: 200,
    description: 'Nickname set successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Nickname already taken or invalid format',
    schema: {
      example: {
        success: false,
        code: 'BAD_REQUEST',
        message: 'Nickname already taken',
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
  async setNickname(
    @CurrentUser() user: Account,
    @Body() setNicknameDto: SetNicknameDto,
  ) {
    return this.accountsService.setNickname(
      (user as any)._id.toString(),
      setNicknameDto.nickname,
    );
  }

  @Get('recipient')
  @ApiOperation({
    summary: 'Get recipient information',
    description:
      'Get recipient information by account number or nickname for transfer',
  })
  @ApiQuery({
    name: 'identifier',
    description: 'Account number (10 digits) or nickname (3-20 characters)',
    example: '9999999999',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Recipient information retrieved successfully',
    type: RecipientInfoResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid identifier format or cannot transfer to self',
    schema: {
      example: {
        success: false,
        code: 'BAD_REQUEST',
        message: 'Invalid identifier format or cannot transfer to self',
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
  @ApiResponse({
    status: 404,
    description: 'Recipient not found',
    schema: {
      example: {
        success: false,
        code: 'NOT_FOUND',
        message: 'Recipient not found',
      },
    },
  })
  async getRecipientInfo(
    @CurrentUser() user: Account,
    @Query('identifier') identifier: string,
  ) {
    return this.accountsService.getRecipientInfo(
      (user as any)._id.toString(),
      identifier,
    );
  }
}

@Controller('balance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BalanceController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get account balance',
    description: 'Returns the current user account balance',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance retrieved successfully',
    type: BalanceResponseDto,
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
  async getBalance(@CurrentUser() user: Account) {
    return this.accountsService.getBalance((user as any)._id.toString());
  }
}
