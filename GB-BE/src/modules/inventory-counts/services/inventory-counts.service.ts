import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { TransactionService } from '../../../database/transaction.service';
import { AuditService } from '../../audit/services/audit.service';
import { BranchesService } from '../../branches/services/branches.service';
import { InventoryItemsService } from '../../inventory-items/services/inventory-items.service';
import { InventoryMovementType } from '../../inventory-movements/domain/inventory-movement.types';
import { InventoryMovementsService } from '../../inventory-movements/services/inventory-movements.service';
import {
  CountStatus,
  InventoryCount,
  InventoryCountRow,
  InventoryCountWithItems,
} from '../domain/inventory-count.interface';
import { CountQuery, StartCountData } from '../domain/inventory-count.types';
import { InventoryCountMapper } from '../mappers/inventory-count.mapper';
import { INVENTORY_COUNTS_REPOSITORY } from '../repositories/inventory-counts.repository.interface';
import type { IInventoryCountsRepository } from '../repositories/inventory-counts.repository.interface';

@Injectable()
export class InventoryCountsService {
  constructor(
    @Inject(INVENTORY_COUNTS_REPOSITORY)
    private readonly countsRepository: IInventoryCountsRepository,
    private readonly branchesService: BranchesService,
    private readonly inventoryItemsService: InventoryItemsService,
    private readonly movementsService: InventoryMovementsService,
    private readonly transactionService: TransactionService,
    private readonly auditService: AuditService,
  ) {}

  async start(
    data: StartCountData,
    actorUserId?: string,
  ): Promise<InventoryCountWithItems> {
    if (data.inventoryItemIds.length === 0) {
      throw new BusinessRuleException(
        'A physical count must include at least one inventory item',
        'COUNT_EMPTY',
      );
    }

    await this.branchesService.findOne(data.businessId, data.branchId);

    const uniqueIds = new Set(data.inventoryItemIds);
    if (uniqueIds.size !== data.inventoryItemIds.length) {
      throw new BusinessRuleException(
        'An inventory item cannot appear more than once in the same count',
        'DUPLICATE_COUNT_ITEM',
      );
    }

    for (const inventoryItemId of data.inventoryItemIds) {
      await this.inventoryItemsService.getOwnedOrFail(
        data.businessId,
        inventoryItemId,
      );
    }

    const row = await this.transactionService.execute(async (client) => {
      const created = await this.countsRepository.create(data, client);

      const itemsWithExpected = await Promise.all(
        data.inventoryItemIds.map(async (inventoryItemId) => ({
          inventoryItemId,
          expectedQuantity: await this.movementsService.getStockForItem(
            data.businessId,
            data.branchId,
            inventoryItemId,
          ),
        })),
      );
      await this.countsRepository.addItems(
        created.id,
        itemsWithExpected,
        client,
      );

      return created;
    });

    await this.auditService.record({
      businessId: data.businessId,
      branchId: data.branchId,
      userId: actorUserId,
      entityType: 'inventory_count',
      entityId: row.id,
      action: 'START',
      newValues: { itemCount: data.inventoryItemIds.length },
    });

    return this.buildWithItems(row);
  }

  async findAll(query: CountQuery): Promise<PaginatedResult<InventoryCount>> {
    const { rows, total } = await this.countsRepository.findAll(query);
    return {
      data: rows.map((row) => InventoryCountMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findOne(
    businessId: string,
    id: string,
  ): Promise<InventoryCountWithItems> {
    const row = await this.getOwnedOrFail(businessId, id);
    return this.buildWithItems(row);
  }

  async recordCount(
    businessId: string,
    id: string,
    inventoryItemId: string,
    countedQuantity: number,
  ): Promise<InventoryCountWithItems> {
    const count = await this.getOwnedOrFail(businessId, id);
    if (count.status !== CountStatus.IN_PROGRESS) {
      throw new BusinessRuleException(
        'Counted quantities can only be recorded while the count is in progress',
        'COUNT_NOT_IN_PROGRESS',
      );
    }

    const item = await this.countsRepository.findItem(id, inventoryItemId);
    if (!item) {
      throw new EntityNotFoundException('InventoryCountItem', inventoryItemId);
    }

    await this.countsRepository.recordCountedQuantity(
      id,
      inventoryItemId,
      countedQuantity,
    );
    return this.buildWithItems(count);
  }

  async complete(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<InventoryCountWithItems> {
    const count = await this.getOwnedOrFail(businessId, id);
    if (count.status !== CountStatus.IN_PROGRESS) {
      throw new BusinessRuleException(
        `Cannot complete a count with status ${count.status}`,
        'COUNT_INVALID_STATUS_TRANSITION',
      );
    }

    const items = await this.countsRepository.findItems(id);

    const updated = await this.transactionService.execute(async (client) => {
      for (const item of items) {
        if (item.counted_quantity === null) {
          continue;
        }
        const expected = parseFloat(item.expected_quantity);
        const counted = parseFloat(item.counted_quantity);
        const difference = Math.round((counted - expected) * 1000) / 1000;

        if (difference === 0) {
          continue;
        }

        await this.movementsService.recordMovement(
          {
            businessId,
            branchId: count.branch_id,
            locationId: count.location_id ?? undefined,
            inventoryItemId: item.inventory_item_id,
            movementType:
              difference > 0
                ? InventoryMovementType.ADJUSTMENT_IN
                : InventoryMovementType.ADJUSTMENT_OUT,
            quantity: Math.abs(difference),
            referenceType: 'inventory_count',
            referenceId: id,
            notes: `Physical count correction (expected ${expected}, counted ${counted})`,
            createdBy: actorUserId,
          },
          client,
        );
      }

      const row = await this.countsRepository.setStatus(
        id,
        businessId,
        CountStatus.COMPLETED,
        actorUserId,
        client,
      );
      if (!row) {
        throw new EntityNotFoundException('InventoryCount', id);
      }
      return row;
    });

    await this.auditService.record({
      businessId,
      branchId: count.branch_id,
      userId: actorUserId,
      entityType: 'inventory_count',
      entityId: id,
      action: 'COMPLETE',
    });

    return this.buildWithItems(updated);
  }

  async cancel(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<InventoryCount> {
    const count = await this.getOwnedOrFail(businessId, id);
    if (count.status !== CountStatus.IN_PROGRESS) {
      throw new BusinessRuleException(
        `Cannot cancel a count with status ${count.status}`,
        'COUNT_INVALID_STATUS_TRANSITION',
      );
    }

    const row = await this.countsRepository.setStatus(
      id,
      businessId,
      CountStatus.CANCELLED,
      actorUserId,
    );
    if (!row) {
      throw new EntityNotFoundException('InventoryCount', id);
    }

    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'inventory_count',
      entityId: id,
      action: 'CANCEL',
    });

    return InventoryCountMapper.toDomain(row);
  }

  private async buildWithItems(
    row: InventoryCountRow,
  ): Promise<InventoryCountWithItems> {
    const itemRows = await this.countsRepository.findItems(row.id);
    return {
      ...InventoryCountMapper.toDomain(row),
      items: itemRows.map((itemRow) =>
        InventoryCountMapper.itemToDomain(itemRow),
      ),
    };
  }

  private async getOwnedOrFail(
    businessId: string,
    id: string,
  ): Promise<InventoryCountRow> {
    const row = await this.countsRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('InventoryCount', id);
    }
    return row;
  }
}
