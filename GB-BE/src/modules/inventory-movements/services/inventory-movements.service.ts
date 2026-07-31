import { Inject, Injectable } from '@nestjs/common';
import { InsufficientStockException } from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { AuditService } from '../../audit/services/audit.service';
import { BranchesService } from '../../branches/services/branches.service';
import { InventoryItemsService } from '../../inventory-items/services/inventory-items.service';
import {
  InventoryMovement,
  LowStockAlert,
  StockLevel,
} from '../domain/inventory-movement.interface';
import {
  InventoryMovementType,
  MovementQuery,
  OUTBOUND_MOVEMENT_TYPES,
  RecordMovementData,
  StockQuery,
} from '../domain/inventory-movement.types';
import { InventoryMovementMapper } from '../mappers/inventory-movement.mapper';
import { INVENTORY_MOVEMENTS_REPOSITORY } from '../repositories/inventory-movements.repository.interface';
import type { IInventoryMovementsRepository } from '../repositories/inventory-movements.repository.interface';

export interface CreateAdjustmentData {
  businessId: string;
  branchId: string;
  locationId?: string;
  inventoryItemId: string;
  direction: 'IN' | 'OUT';
  quantity: number;
  reason: string;
}

@Injectable()
export class InventoryMovementsService {
  constructor(
    @Inject(INVENTORY_MOVEMENTS_REPOSITORY)
    private readonly movementsRepository: IInventoryMovementsRepository,
    private readonly inventoryItemsService: InventoryItemsService,
    private readonly branchesService: BranchesService,
    private readonly auditService: AuditService,
  ) {}

  async createAdjustment(
    data: CreateAdjustmentData,
    actorUserId?: string,
  ): Promise<InventoryMovement> {
    await this.branchesService.findOne(data.businessId, data.branchId);
    await this.inventoryItemsService.getOwnedOrFail(
      data.businessId,
      data.inventoryItemId,
    );

    const movement = await this.recordMovement({
      businessId: data.businessId,
      branchId: data.branchId,
      locationId: data.locationId,
      inventoryItemId: data.inventoryItemId,
      movementType:
        data.direction === 'IN'
          ? InventoryMovementType.ADJUSTMENT_IN
          : InventoryMovementType.ADJUSTMENT_OUT,
      quantity: data.quantity,
      referenceType: 'manual_adjustment',
      notes: data.reason,
      createdBy: actorUserId,
    });

    await this.auditService.record({
      businessId: data.businessId,
      branchId: data.branchId,
      userId: actorUserId,
      entityType: 'inventory_movement',
      entityId: movement.id,
      action: 'ADJUSTMENT',
      newValues: {
        direction: data.direction,
        quantity: data.quantity,
        reason: data.reason,
      },
    });

    return movement;
  }

  /**
   * The single write path for inventory movements — every other module
   * (adjustments, transfers, counts, goods receipts, and future waste/order
   * consumption) records stock changes through this method so validation
   * (sufficient stock for outbound movements) is never bypassed. Pass the
   * transaction's `client` when part of a larger atomic operation.
   */
  async recordMovement(
    data: RecordMovementData,
    client?: DbClient,
  ): Promise<InventoryMovement> {
    if (OUTBOUND_MOVEMENT_TYPES.has(data.movementType)) {
      const available = await this.movementsRepository.getStockForItem(
        data.businessId,
        data.branchId,
        data.inventoryItemId,
        client,
      );
      if (available < data.quantity) {
        const item = await this.inventoryItemsService.getOwnedOrFail(
          data.businessId,
          data.inventoryItemId,
        );
        throw new InsufficientStockException(
          item.name,
          available,
          data.quantity,
        );
      }
    }

    const row = await this.movementsRepository.create(data, client);
    return InventoryMovementMapper.toDomain(row);
  }

  async getKardex(
    query: MovementQuery,
  ): Promise<PaginatedResult<InventoryMovement>> {
    const { rows, total } = await this.movementsRepository.findAll(query);
    return {
      data: rows.map((row) => InventoryMovementMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getStock(query: StockQuery): Promise<StockLevel[]> {
    const rows = await this.movementsRepository.getStock(query);
    return rows.map((row) => InventoryMovementMapper.stockToDomain(row));
  }

  async getStockForItem(
    businessId: string,
    branchId: string,
    inventoryItemId: string,
  ): Promise<number> {
    return this.movementsRepository.getStockForItem(
      businessId,
      branchId,
      inventoryItemId,
    );
  }

  async getLowStockAlerts(
    businessId: string,
    branchId?: string,
  ): Promise<LowStockAlert[]> {
    const rows = await this.movementsRepository.getLowStock(
      businessId,
      branchId,
    );
    return rows.map((row) => InventoryMovementMapper.lowStockToDomain(row));
  }

  /** Used by OrdersService to find what a cancelled order already consumed, so it can be reversed. */
  async getMovementsByReference(
    referenceType: string,
    referenceId: string,
    client?: DbClient,
  ): Promise<InventoryMovement[]> {
    const rows = await this.movementsRepository.findByReference(
      referenceType,
      referenceId,
      client,
    );
    return rows.map((row) => InventoryMovementMapper.toDomain(row));
  }
}
