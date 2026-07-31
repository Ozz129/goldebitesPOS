import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { AuditLogQueryDto } from '../dto/audit-log-query.dto';
import { AuditService } from '../services/audit.service';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Permissions('settings.manage')
  @ApiOperation({ summary: 'Query the audit trail for the current business' })
  findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: AuditLogQueryDto,
  ) {
    return this.auditService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      entityType: query.entityType,
      entityId: query.entityId,
      userId: query.userId,
      action: query.action,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });
  }
}
