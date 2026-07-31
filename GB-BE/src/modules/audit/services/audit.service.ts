import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { AuditLog, AuditLogQuery } from '../domain/audit-log.interface';
import { RecordAuditEntryData } from '../domain/audit-log.types';
import { AuditLogMapper } from '../mappers/audit-log.mapper';
import { AUDIT_LOG_REPOSITORY } from '../repositories/audit-log.repository.interface';
import type { IAuditLogRepository } from '../repositories/audit-log.repository.interface';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  /**
   * Records an audit entry. When called with `client` (inside an active
   * transaction) failures propagate so the whole operation rolls back.
   * Called standalone, failures are logged but never break the caller —
   * an audit trail gap should not take down a user-facing request.
   */
  async record(data: RecordAuditEntryData, client?: DbClient): Promise<void> {
    if (client) {
      await this.auditLogRepository.insert(data, client);
      return;
    }

    try {
      await this.auditLogRepository.insert(data);
    } catch (error) {
      this.logger.error(
        `Failed to record audit entry for ${data.entityType}/${data.action}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async findAll(query: AuditLogQuery): Promise<PaginatedResult<AuditLog>> {
    const { rows, total } = await this.auditLogRepository.findAll(query);
    return {
      data: rows.map((row) => AuditLogMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }
}
