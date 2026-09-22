import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../common/exceptions';
import { AuditService } from '../../audit/services/audit.service';
import { BranchesService } from '../../branches/services/branches.service';
import { TableName } from '../domain/table-name.interface';
import { UpsertTableNameData } from '../domain/table-name.types';
import { TableNameMapper } from '../mappers/table-name.mapper';
import { TABLE_NAMES_REPOSITORY } from '../repositories/table-names.repository.interface';
import type { ITableNamesRepository } from '../repositories/table-names.repository.interface';

@Injectable()
export class TableNamesService {
  constructor(
    @Inject(TABLE_NAMES_REPOSITORY)
    private readonly tableNamesRepository: ITableNamesRepository,
    private readonly branchesService: BranchesService,
    private readonly auditService: AuditService,
  ) {}

  async upsert(data: UpsertTableNameData): Promise<TableName> {
    await this.branchesService.findOne(data.businessId, data.branchId);
    const existing = await this.tableNamesRepository.findOne(
      data.businessId,
      data.branchId,
      data.tableNumber,
    );

    const row = await this.tableNamesRepository.upsert(data);
    await this.auditService.record({
      businessId: data.businessId,
      branchId: data.branchId,
      userId: data.actorUserId,
      entityType: 'table_name',
      entityId: row.id,
      action: 'SET',
      oldValues: existing ? { name: existing.name } : undefined,
      newValues: { tableNumber: data.tableNumber, name: data.name },
    });
    return TableNameMapper.toDomain(row);
  }

  async findAllByBranch(businessId: string, branchId: string): Promise<TableName[]> {
    await this.branchesService.findOne(businessId, branchId);
    const rows = await this.tableNamesRepository.findAllByBranch(businessId, branchId);
    return rows.map((row) => TableNameMapper.toDomain(row));
  }

  async clear(
    businessId: string,
    branchId: string,
    tableNumber: string,
    actorUserId?: string,
  ): Promise<void> {
    const deleted = await this.tableNamesRepository.delete(businessId, branchId, tableNumber);
    if (!deleted) {
      throw new EntityNotFoundException('TableName', tableNumber);
    }
    await this.auditService.record({
      businessId,
      branchId,
      userId: actorUserId,
      entityType: 'table_name',
      entityId: tableNumber,
      action: 'CLEAR',
    });
  }

  /** Used by NfcTagsService.resolvePublic() — the token resolver already validated business/branch, so this is a lean lookup with no extra ownership check. */
  async findName(
    businessId: string,
    branchId: string,
    tableNumber: string,
  ): Promise<string | null> {
    const row = await this.tableNamesRepository.findOne(businessId, branchId, tableNumber);
    return row?.name ?? null;
  }
}
