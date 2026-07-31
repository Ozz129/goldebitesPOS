export interface RecordAuditEntryData {
  businessId?: string | null;
  branchId?: string | null;
  userId?: string | null;
  entityType: string;
  entityId?: string | null;
  action: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}
