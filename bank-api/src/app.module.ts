import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { EmailModule } from './modules/email/email.module';
import { AuditModule } from './modules/audit/audit.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import emailConfig from './config/email.config';
import transactionConfig from './config/transaction.config';
import throttleConfig from './config/throttle.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        emailConfig,
        transactionConfig,
        throttleConfig,
      ],
    }),

    // Logging
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              },
        serializers: {
          req: (req) => ({
            method: req.method,
            url: req.url,
            headers: {
              authorization: req.headers.authorization
                ? '[REDACTED]'
                : undefined,
            },
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
      },
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: 60000, // 1 minute
            limit: 100, // 100 requests per minute
          },
        ],
      }),
    }),

    // Database
    DatabaseModule,

    // Feature modules
    AuthModule,
    AccountsModule,
    TransactionsModule,
    WalletModule,
    AdminModule,
    HealthModule,
    EmailModule,
    AuditModule,
    TransfersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
