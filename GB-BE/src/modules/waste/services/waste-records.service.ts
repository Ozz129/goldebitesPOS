import { Inject, Injectable } from '@nestjs/common';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { TransactionService } from '../../../database/transaction.service';
import { AuditService } from '../../audit/services/audit.service';
import { BranchesService } from '../../branches/services/branches.service';
import { InventoryItemsService } from '../../inventory-items/services/inventory-items.service';
import { InventoryMovementType } from '../../inventory-movements/domain/inventory-movement.types';
import { InventoryMovementsService } from '../../inventory-movements/services/inventory-movements.service';
import { WasteRecord } from '../domain/waste-record.interface';
import {
  CreateWasteRecordData,
  WasteRecordQuery,
} from '../domain/waste-record.types';
import { WasteRecordMapper } from '../mappers/waste-record.mapper';
import { WASTE_RECORDS_REPOSITORY } from '../repositories/waste-records.repository.interface';
import type { IWasteRecordsRepository } from '../repositories/waste-records.repository.interface';

@Injectable()
export class WasteRecordsService {
  constructor(
    @Inject(WASTE_RECORDS_REPOSITORY)
    private readonly wasteRepository: IWasteRecordsRepository,
    private readonly branchesService: BranchesService,
    private readonly inventoryItemsService: InventoryItemsService,
    private readonly movementsService: InventoryMovementsService,
    private readonly transactionService: TransactionService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    data: CreateWasteRecordData,
    actorUserId?: string,
  ): Promise<WasteRecord> {
    await this.branchesService.findOne(data.businessId, data.branchId);
    const item = await this.inventoryItemsService.getOwnedOrFail(
      data.businessId,
      data.inventoryItemId,
    );
    const unitCost = parseFloat(item.current_cost);

    const row = await this.transactionService.execute(async (client) => {
      const created = await this.wasteRepository.create(
        data,
        unitCost,
        actorUserId,
        client,
      );
      await this.movementsService.recordMovement(
        {
          businessId: data.businessId,
          branchId: data.branchId,
          inventoryItemId: data.inventoryItemId,
          movementType: InventoryMovementType.WASTE,
          quantity: data.quantity,
          unitCost,
          referenceType: 'waste_record',
          referenceId: created.id,
          notes: data.reason,
          createdBy: actorUserId,
        },
        client,
      );
      return created;
    });

    await this.auditService.record({
      businessId: data.businessId,
      branchId: data.branchId,
      userId: actorUserId,
      entityType: 'waste_record',
      entityId: row.id,
      action: 'CREATE',
      newValues: {
        inventoryItemId: data.inventoryItemId,
        quantity: data.quantity,
        reason: data.reason,
      },
    });

    return WasteRecordMapper.toDomain(row);
  }

  async findAll(
    query: WasteRecordQuery,
  ): Promise<PaginatedResult<WasteRecord>> {
    const { rows, total } = await this.wasteRepository.findAll(query);
    return {
      data: rows.map((row) => WasteRecordMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }
}
