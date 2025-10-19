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
