import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AuditLog,
  AuditLogDocument,
} from '../../database/schemas/audit-log.schema';

export interface AuditLogData {
  actorId?: string;
  action: string;
  resource: string;
  meta?: any;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async log(auditData: AuditLogData) {
    const auditLog = new this.auditLogModel({
      ...auditData,
      actorId: auditData.actorId ? auditData.actorId : undefined,
    });

    await auditLog.save();
  }
}
