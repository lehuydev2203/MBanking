import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Decimal128 } from 'mongodb';

export type TransactionDocument = Transaction & Document;

export enum TransactionType {
  DEPOSIT = 1,
  WITHDRAW = 2,
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({
    type: Types.ObjectId,
    ref: 'Account',
    required: true,
  })
  accountId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  transName: string;

  @Prop({
    type: Decimal128,
    required: true,
    validate: {
      validator: function (value: Decimal128) {
        return parseFloat(value.toString()) > 0;
      },
      message: 'Transaction amount must be greater than 0',
    },
  })
  transMoney: Decimal128;

  @Prop({
    enum: TransactionType,
    required: true,
  })
  transType: TransactionType;

  @Prop({
    unique: true,
    sparse: true,
  })
  clientRequestId?: string;

  createdAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Indexes
TransactionSchema.index({ accountId: 1, createdAt: -1 });
