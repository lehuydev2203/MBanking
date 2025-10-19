import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';
import { Account, AccountSchema } from '../../database/schemas/account.schema';
import {
  TransferVerification,
  TransferVerificationSchema,
} from '../../database/schemas/transfer-verification.schema';
import {
  Transaction,
  TransactionSchema,
} from '../../database/schemas/transaction.schema';
import { EmailModule } from '../email/email.module';
import { AuditModule } from '../audit/audit.module';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: TransferVerification.name, schema: TransferVerificationSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    EmailModule,
    AuditModule,
    AccountsModule,
  ],
  controllers: [TransfersController],
  providers: [TransfersService],
  exports: [TransfersService],
})
export class TransfersModule {}
