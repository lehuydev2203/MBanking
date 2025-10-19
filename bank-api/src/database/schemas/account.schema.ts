import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Decimal128 } from 'mongodb';

export type AccountDocument = Account & Document;

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

export enum Status {
  ACTIVE = 'active',
  LOCKED = 'locked',
}

@Schema({
  timestamps: true,
  toJSON: {
    transform: function (doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.passwordHash;
      if (ret.balance) {
        ret.balance = parseFloat(ret.balance.toString());
      }
      return ret;
    },
  },
})
export class Account {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    unique: true,
    sparse: true,
    trim: true,
  })
  phone?: string;

  @Prop({
    unique: true,
    required: true,
    trim: true,
    length: 10,
  })
  accountNumber: string;

  @Prop({
    unique: true,
    sparse: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  })
  nickname?: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Prop({
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @Prop({
    type: Decimal128,
    default: Decimal128.fromString('0'),
  })
  balance: Decimal128;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  verifiedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);

// Indexes
AccountSchema.index({ role: 1 });
AccountSchema.index({ status: 1 });
