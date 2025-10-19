import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongooseModule } from '@nestjs/mongoose';
import jwtConfig from '../../config/jwt.config';
import throttleConfig from '../../config/throttle.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailModule } from '../email/email.module';
import { AuditModule } from '../audit/audit.module';
import { AccountsModule } from '../accounts/accounts.module';
import { Account, AccountSchema } from '../../database/schemas/account.schema';
import {
  EmailVerification,
  EmailVerificationSchema,
} from '../../database/schemas/email-verification.schema';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(throttleConfig),
    PassportModule,
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: EmailVerification.name, schema: EmailVerificationSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('throttle.ttl') || 600000,
            limit: configService.get<number>('throttle.limit') || 5,
          },
        ],
      }),
      inject: [ConfigService],
    }),
    EmailModule,
    AuditModule,
    AccountsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
