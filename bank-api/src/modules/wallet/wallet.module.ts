import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [TransactionsModule],
  controllers: [WalletController],
})
export class WalletModule {}
