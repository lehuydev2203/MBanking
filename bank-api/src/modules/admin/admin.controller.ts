import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminUserQueryDto } from './dto/admin-user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminTransactionQueryDto } from './dto/admin-transaction-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../database/schemas/account.schema';
import { Account } from '../../database/schemas/account.schema';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Get users list',
    description:
      'Retrieves paginated list of users with search and filter options (Admin/Superadmin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
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
    status: 403,
    description: 'Insufficient permissions',
    schema: {
      example: {
        success: false,
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
      },
    },
  })
  async getUsers(
    @Query() query: AdminUserQueryDto,
    @CurrentUser() user: Account,
  ) {
    return this.adminService.getUsers(query, (user as any)._id.toString());
  }

  @Patch('users/:id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates user role or status (Superadmin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
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
    status: 403,
    description: 'Insufficient permissions or self-demotion attempt',
    schema: {
      examples: {
        insufficientPermissions: {
          summary: 'Insufficient permissions',
          value: {
            success: false,
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          },
        },
        selfDemotion: {
          summary: 'Self-demotion attempt',
          value: {
            success: false,
            code: 'FORBIDDEN',
            message: 'Cannot demote yourself from superadmin role',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: { success: false, code: 'NOT_FOUND', message: 'User not found' },
    },
  })
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: Account,
  ) {
    return this.adminService.updateUser(
      userId,
      updateUserDto,
      (user as any)._id.toString(),
    );
  }

  @Post('users/:id/resend-verification')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Resend user verification',
    description:
      'Resends verification email to a specific user (Admin/Superadmin only)',
  })
  @ApiResponse({
    status: 202,
    description: 'Verification email resent',
    schema: {
      example: { success: true, data: { message: 'VERIFICATION_SENT' } },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'User already verified',
    schema: {
      example: {
        success: false,
        code: 'BAD_REQUEST',
        message: 'User email is already verified',
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
    status: 403,
    description: 'Insufficient permissions',
    schema: {
      example: {
        success: false,
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: { success: false, code: 'NOT_FOUND', message: 'User not found' },
    },
  })
  async resendUserVerification(
    @Param('id') userId: string,
    @CurrentUser() user: Account,
  ) {
    return this.adminService.resendUserVerification(
      userId,
      (user as any)._id.toString(),
    );
  }

  @Get('transactions')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Get transactions list',
    description:
      'Retrieves paginated list of all transactions with filters (Admin/Superadmin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
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
    status: 403,
    description: 'Insufficient permissions',
    schema: {
      example: {
        success: false,
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
      },
    },
  })
  async getTransactions(
    @Query() query: AdminTransactionQueryDto,
    @CurrentUser() user: Account,
  ) {
    return this.adminService.getTransactions(query);
  }
}
