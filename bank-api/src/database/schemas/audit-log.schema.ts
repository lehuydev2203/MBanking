import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({
    type: Types.ObjectId,
    ref: 'Account',
    index: true,
  })
  actorId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  action: string;

  @Prop({ required: true, trim: true })
  resource: string;

  @Prop({ type: Object })
  meta?: any;

  createdAt: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes
AuditLogSchema.index({ createdAt: -1 });
