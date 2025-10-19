import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmailVerificationDocument = EmailVerification & Document;

@Schema({ timestamps: true })
export class EmailVerification {
  @Prop({
    type: Types.ObjectId,
    ref: 'Account',
    required: true,
    index: true,
  })
  accountId: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  code: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop()
  usedAt?: Date;
}

export const EmailVerificationSchema =
  SchemaFactory.createForClass(EmailVerification);

// Indexes
EmailVerificationSchema.index({ accountId: 1, createdAt: -1 });
EmailVerificationSchema.index({ code: 1 }, { unique: true });
