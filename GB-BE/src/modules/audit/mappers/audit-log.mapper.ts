import { AuditLog, AuditLogRow } from '../domain/audit-log.interface';

export class AuditLogMapper {
  static toDomain(row: AuditLogRow): AuditLog {
    return {
      id: row.id,
      businessId: row.business_id,
      branchId: row.branch_id,
      userId: row.user_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      action: row.action,
      oldValues: row.old_values,
      newValues: row.new_values,
      metadata: row.metadata,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at,
    };
  }
}
