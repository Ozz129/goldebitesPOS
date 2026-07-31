import { Module } from '@nestjs/common';
import { AuditLogsController } from './controllers/audit-logs.controller';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { AUDIT_LOG_REPOSITORY } from './repositories/audit-log.repository.interface';
import { AuditService } from './services/audit.service';

@Module({
  controllers: [AuditLogsController],
  providers: [
    AuditService,
    { provide: AUDIT_LOG_REPOSITORY, useClass: AuditLogRepository },
  ],
  exports: [AuditService],
})
export class AuditModule {}
