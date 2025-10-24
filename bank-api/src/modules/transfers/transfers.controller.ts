import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TransfersService } from './transfers.service';
import { AccountsService } from '../accounts/accounts.service';
import { TransferRequestDto } from './dto/transfer-request.dto';
import { TransferConfirmDto } from './dto/transfer-confirm.dto';
import { SetNicknameDto } from './dto/set-nickname.dto';
import {
  TransferInitiateResponseDto,
  TransferConfirmResponseDto,
} from './dto/transfer-response.dto';

@ApiTags('Transfers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transfers')
export class TransfersController {
  constructor(
    private transfersService: TransfersService,
    private accountsService: AccountsService,
  ) {}

  @Post('initiate')
  @ApiOperation({
    summary: 'Khởi tạo chuyển khoản',
    description:
      'Bắt đầu quá trình chuyển khoản. Hệ thống sẽ gửi mã xác nhận 6 chữ số qua email để xác thực giao dịch.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Chuyển khoản được khởi tạo thành công, mã xác nhận đã được gửi qua email',
    type: TransferInitiateResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Dữ liệu đầu vào không hợp lệ hoặc không tìm thấy tài khoản người nhận',
  })
  @ApiResponse({
    status: 403,
    description: 'Số dư không đủ hoặc vượt quá giới hạn giao dịch',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy tài khoản người nhận',
  })
  async initiateTransfer(
    @Request() req,
    @Body() transferRequestDto: TransferRequestDto,
  ) {
    const userId = req.user._id ? req.user._id.toString() : req.user.sub;
    return this.transfersService.initiateTransfer(userId, transferRequestDto);
  }

  @Post('confirm')
  @ApiOperation({
    summary: 'Xác nhận chuyển khoản',
    description:
      'Hoàn tất giao dịch chuyển khoản bằng mã xác nhận 6 chữ số đã nhận qua email.',
  })
  @ApiResponse({
    status: 200,
    description: 'Chuyển khoản hoàn tất thành công',
    type: TransferConfirmResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Mã xác nhận không hợp lệ hoặc đã hết hạn',
  })
  @ApiResponse({
    status: 403,
    description: 'Số dư không đủ để thực hiện giao dịch',
  })
  async confirmTransfer(
    @Request() req,
    @Body() transferConfirmDto: TransferConfirmDto,
  ) {
    const userId = req.user._id ? req.user._id.toString() : req.user.sub;
    return this.transfersService.confirmTransfer(userId, transferConfirmDto);
  }

  @Get('history')
  @ApiOperation({
    summary: 'Lịch sử chuyển khoản (Deprecated)',
    description:
      '⚠️ API này đã được tích hợp vào /transactions. Vui lòng sử dụng GET /transactions để lấy lịch sử giao dịch đầy đủ bao gồm cả chuyển khoản. API này sẽ được loại bỏ trong phiên bản tương lai.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang (bắt đầu từ 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Số lượng giao dịch mỗi trang (mặc định 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy lịch sử chuyển khoản thành công',
  })
  async getTransferHistory(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    const userId = req.user._id ? req.user._id.toString() : req.user.sub;
    return this.transfersService.getTransferHistory(userId, page, pageSize);
  }

  @Post('nickname')
  @ApiOperation({
    summary: 'Đặt biệt danh tài khoản',
    description:
      'Thiết lập biệt danh cho tài khoản để người khác có thể chuyển tiền dễ dàng hơn thay vì nhớ số tài khoản dài.',
  })
  @ApiResponse({
    status: 200,
    description: 'Đặt biệt danh thành công',
  })
  @ApiResponse({
    status: 400,
    description: 'Biệt danh đã được sử dụng hoặc định dạng không hợp lệ',
  })
  async setNickname(@Request() req, @Body() setNicknameDto: SetNicknameDto) {
    return this.accountsService.setNickname(
      req.user.sub,
      setNicknameDto.nickname,
    );
  }
}
