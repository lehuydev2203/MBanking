import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import appConfig from '../../config/app.config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.host'),
      port: this.configService.get<number>('email.port'),
      secure: false,
      auth: {
        user: this.configService.get<string>('email.user'),
        pass: this.configService.get<string>('email.pass'),
      },
    });
  }

  async sendVerificationEmail(email: string, code: string) {
    const baseUrl = this.configService.get<string>('app.baseUrl');
    const verificationUrl = `${baseUrl}/verify-email?code=${code}`;

    const mailOptions = {
      from: this.configService.get<string>('email.from'),
      to: email,
      subject: 'Verify Your Email - Banking API',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Thank you for registering with our banking service!</p>
          <p>Please use the following verification code to activate your account:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0;">${code}</h1>
          </div>
          <p>Or click the link below:</p>
          <p><a href="${verificationUrl}" style="color: #007bff;">Verify Email Address</a></p>
          <p><strong>This code will expire in 15 minutes.</strong></p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `,
      text: `
        Email Verification
        
        Thank you for registering with our banking service!
        
        Please use the following verification code to activate your account:
        
        ${code}
        
        Or visit: ${verificationUrl}
        
        This code will expire in 15 minutes.
        
        If you didn't request this verification, please ignore this email.
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // In production, you might want to throw an error or use a retry mechanism
      // For now, we'll just log the error to avoid breaking the registration flow
    }
  }

  async sendWelcomeEmail(
    email: string,
    accountDetails: {
      name: string;
      accountNumber: string;
    },
  ) {
    const { name, accountNumber } = accountDetails;
    const baseUrl = this.configService.get<string>('app.baseUrl');

    const mailOptions = {
      from: this.configService.get<string>('email.from'),
      to: email,
      subject: 'Chào mừng đến với MBanking - Tài khoản đã được tạo thành công!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #7c8cf9; margin: 0; font-size: 28px;">🎉 Chào mừng đến với MBanking!</h1>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Xin chào <strong>${name}</strong>,</p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Chúc mừng! Tài khoản ngân hàng của bạn đã được tạo thành công. Dưới đây là thông tin tài khoản của bạn:
            </p>
            
            <div style="background: linear-gradient(135deg, #7c8cf9, #22d3ee); padding: 25px; margin: 25px 0; border-radius: 10px; text-align: center;">
              <h2 style="color: white; margin: 0 0 15px 0; font-size: 24px;">Số tài khoản của bạn</h2>
              <div style="background-color: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; display: inline-block;">
                <span style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 2px;">${accountNumber}</span>
              </div>
            </div>
            
            <div style="background-color: #e8f4fd; padding: 20px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #7c8cf9;">
              <h3 style="color: #333; margin-top: 0;">📋 Hướng dẫn tiếp theo:</h3>
              <ul style="color: #333; line-height: 1.8;">
                <li>Đăng nhập vào ứng dụng MBanking bằng email và mật khẩu của bạn</li>
                <li>Truy cập trang <strong>Hồ sơ cá nhân</strong> để tạo nickname duy nhất</li>
                <li>Nickname giúp bạn dễ dàng nhận tiền từ người khác</li>
                <li>Nickname chỉ có thể tạo <strong>1 lần duy nhất</strong> và không thể chỉnh sửa</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/login" style="background: linear-gradient(135deg, #7c8cf9, #22d3ee); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Đăng nhập ngay
              </a>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <h4 style="color: #333; margin-top: 0;">🔒 Bảo mật tài khoản:</h4>
              <ul style="color: #666; line-height: 1.6; font-size: 14px;">
                <li>Không chia sẻ số tài khoản và thông tin đăng nhập với bất kỳ ai</li>
                <li>Luôn đăng xuất sau khi sử dụng</li>
                <li>Thay đổi mật khẩu định kỳ</li>
                <li>Liên hệ hỗ trợ nếu phát hiện hoạt động bất thường</li>
              </ul>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              Email này được gửi tự động từ hệ thống MBanking. Vui lòng không trả lời email này.
            </p>
          </div>
        </div>
      `,
      text: `
        Chào mừng đến với MBanking!
        
        Xin chào ${name},
        
        Chúc mừng! Tài khoản ngân hàng của bạn đã được tạo thành công.
        
        Số tài khoản của bạn: ${accountNumber}
        
        Hướng dẫn tiếp theo:
        - Đăng nhập vào ứng dụng MBanking bằng email và mật khẩu của bạn
        - Truy cập trang Hồ sơ cá nhân để tạo nickname duy nhất
        - Nickname giúp bạn dễ dàng nhận tiền từ người khác
        - Nickname chỉ có thể tạo 1 lần duy nhất và không thể chỉnh sửa
        
        Đăng nhập tại: ${baseUrl}/login
        
        Bảo mật tài khoản:
        - Không chia sẻ số tài khoản và thông tin đăng nhập với bất kỳ ai
        - Luôn đăng xuất sau khi sử dụng
        - Thay đổi mật khẩu định kỳ
        - Liên hệ hỗ trợ nếu phát hiện hoạt động bất thường
        
        Email này được gửi tự động từ hệ thống MBanking.
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // In production, you might want to throw an error or use a retry mechanism
    }
  }

  async sendNicknameCreatedEmail(
    email: string,
    accountDetails: {
      name: string;
      nickname: string;
      accountNumber: string;
    },
  ) {
    const { name, nickname, accountNumber } = accountDetails;
    const baseUrl = this.configService.get<string>('app.baseUrl');

    const mailOptions = {
      from: this.configService.get<string>('email.from'),
      to: email,
      subject: 'Nickname đã được tạo thành công - MBanking',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #7c8cf9; margin: 0; font-size: 28px;">🎉 Nickname đã được tạo thành công!</h1>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Xin chào <strong>${name}</strong>,</p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Chúc mừng! Nickname của bạn đã được tạo thành công. Bây giờ bạn có thể sử dụng nickname để nhận tiền một cách dễ dàng hơn.
            </p>
            
            <div style="background: linear-gradient(135deg, #22d3ee, #7c8cf9); padding: 25px; margin: 25px 0; border-radius: 10px; text-align: center;">
              <h2 style="color: white; margin: 0 0 15px 0; font-size: 24px;">Nickname của bạn</h2>
              <div style="background-color: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; display: inline-block;">
                <span style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 1px;">@${nickname}</span>
              </div>
            </div>
            
            <div style="background-color: #f0f9ff; padding: 20px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #22d3ee;">
              <h3 style="color: #333; margin-top: 0;">📋 Thông tin tài khoản:</h3>
              <ul style="color: #333; line-height: 1.8;">
                <li><strong>Số tài khoản:</strong> ${accountNumber}</li>
                <li><strong>Nickname:</strong> @${nickname}</li>
                <li><strong>Email:</strong> ${email}</li>
              </ul>
            </div>
            
            <div style="background-color: #e8f4fd; padding: 20px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #7c8cf9;">
              <h3 style="color: #333; margin-top: 0;">💡 Cách sử dụng nickname:</h3>
              <ul style="color: #333; line-height: 1.8;">
                <li>Người khác có thể chuyển tiền cho bạn bằng nickname <strong>@${nickname}</strong></li>
                <li>Nickname dễ nhớ hơn số tài khoản dài</li>
                <li>Bạn vẫn có thể sử dụng số tài khoản ${accountNumber} như bình thường</li>
                <li><strong>Lưu ý:</strong> Nickname chỉ có thể tạo 1 lần duy nhất và không thể thay đổi</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/profile" style="background: linear-gradient(135deg, #7c8cf9, #22d3ee); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Xem hồ sơ cá nhân
              </a>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <h4 style="color: #333; margin-top: 0;">🔒 Bảo mật:</h4>
              <ul style="color: #666; line-height: 1.6; font-size: 14px;">
                <li>Không chia sẻ nickname với người lạ</li>
                <li>Chỉ chấp nhận chuyển tiền từ người quen biết</li>
                <li>Kiểm tra thông tin người gửi trước khi nhận tiền</li>
                <li>Liên hệ hỗ trợ nếu có giao dịch bất thường</li>
              </ul>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              Email này được gửi tự động từ hệ thống MBanking. Vui lòng không trả lời email này.
            </p>
          </div>
        </div>
      `,
      text: `
        Nickname đã được tạo thành công!
        
        Xin chào ${name},
        
        Chúc mừng! Nickname của bạn đã được tạo thành công.
        
        Nickname của bạn: @${nickname}
        
        Thông tin tài khoản:
        - Số tài khoản: ${accountNumber}
        - Nickname: @${nickname}
        - Email: ${email}
        
        Cách sử dụng nickname:
        - Người khác có thể chuyển tiền cho bạn bằng nickname @${nickname}
        - Nickname dễ nhớ hơn số tài khoản dài
        - Bạn vẫn có thể sử dụng số tài khoản ${accountNumber} như bình thường
        - Lưu ý: Nickname chỉ có thể tạo 1 lần duy nhất và không thể thay đổi
        
        Xem hồ sơ cá nhân tại: ${baseUrl}/profile
        
        Bảo mật:
        - Không chia sẻ nickname với người lạ
        - Chỉ chấp nhận chuyển tiền từ người quen biết
        - Kiểm tra thông tin người gửi trước khi nhận tiền
        - Liên hệ hỗ trợ nếu có giao dịch bất thường
        
        Email này được gửi tự động từ hệ thống MBanking.
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send nickname created email:', error);
      // In production, you might want to throw an error or use a retry mechanism
    }
  }

  async sendTransferVerificationEmail(
    email: string,
    code: string,
    transferDetails: {
      recipientName: string;
      recipientAccountNumber: string;
      amount: number;
      transName: string;
    },
  ) {
    const { recipientName, recipientAccountNumber, amount, transName } =
      transferDetails;

    const mailOptions = {
      from: this.configService.get<string>('email.from'),
      to: email,
      subject: 'Transfer Verification Code - Banking API',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Transfer Verification</h2>
          <p>You have initiated a transfer with the following details:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="color: #333; margin-top: 0;">Transfer Details</h3>
            <p><strong>Recipient:</strong> ${recipientName}</p>
            <p><strong>Account Number:</strong> ${recipientAccountNumber}</p>
            <p><strong>Amount:</strong> ${amount.toLocaleString('vi-VN')} VND</p>
            <p><strong>Description:</strong> ${transName}</p>
          </div>
          
          <p>Please use the following verification code to confirm the transfer:</p>
          <div style="background-color: #e8f4fd; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0;">${code}</h1>
          </div>
          
          <p><strong>This code will expire in 5 minutes.</strong></p>
          <p>If you did not initiate this transfer, please ignore this email and contact support immediately.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `,
      text: `
        Transfer Verification
        
        You have initiated a transfer with the following details:
        
        Recipient: ${recipientName}
        Account Number: ${recipientAccountNumber}
        Amount: ${amount.toLocaleString('vi-VN')} VND
        Description: ${transName}
        
        Please use the following verification code to confirm the transfer:
        
        ${code}
        
        This code will expire in 5 minutes.
        
        If you did not initiate this transfer, please ignore this email and contact support immediately.
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send transfer verification email:', error);
      // In production, you might want to throw an error or use a retry mechanism
    }
  }
}
