import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsService } from './accounts.service';
import { AccountsController, BalanceController } from './accounts.controller';
import { AuditModule } from '../audit/audit.module';
import { EmailModule } from '../email/email.module';
import { Account, AccountSchema } from '../../database/schemas/account.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    AuditModule,
    EmailModule,
  ],
  controllers: [AccountsController, BalanceController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
