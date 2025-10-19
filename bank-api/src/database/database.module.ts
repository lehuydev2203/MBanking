import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from '../config/database.config';
import { Account, AccountSchema } from './schemas/account.schema';
import {
  EmailVerification,
  EmailVerificationSchema,
} from './schemas/email-verification.schema';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';
import {
  TransferVerification,
  TransferVerificationSchema,
} from './schemas/transfer-verification.schema';

@Module({
  imports: [
    ConfigModule.forFeature(databaseConfig),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        ...configService.get('database.options'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: EmailVerification.name, schema: EmailVerificationSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: TransferVerification.name, schema: TransferVerificationSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
