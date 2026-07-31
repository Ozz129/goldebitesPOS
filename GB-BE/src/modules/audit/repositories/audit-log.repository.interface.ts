import { DbClient } from '../../../database/types/database.types';
import { AuditLogQuery, AuditLogRow } from '../domain/audit-log.interface';
import { RecordAuditEntryData } from '../domain/audit-log.types';

export interface IAuditLogRepository {
  insert(data: RecordAuditEntryData, client?: DbClient): Promise<void>;
  findAll(
    query: AuditLogQuery,
  ): Promise<{ rows: AuditLogRow[]; total: number }>;
}

export const AUDIT_LOG_REPOSITORY = Symbol('AUDIT_LOG_REPOSITORY');
