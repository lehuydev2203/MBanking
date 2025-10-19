import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransferVerificationDocument = TransferVerification & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: function (doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class TransferVerification {
  @Prop({ required: true })
  accountId: string;

  @Prop({ required: true, length: 6 })
  code: string;

  @Prop({ required: true })
  recipientAccountNumber: string;

  @Prop({ required: true })
  recipientName: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  transName: string;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop()
  usedAt?: Date;

  @Prop({ required: true })
  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const TransferVerificationSchema =
  SchemaFactory.createForClass(TransferVerification);

// Indexes
TransferVerificationSchema.index({ accountId: 1, isUsed: 1 });
TransferVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
