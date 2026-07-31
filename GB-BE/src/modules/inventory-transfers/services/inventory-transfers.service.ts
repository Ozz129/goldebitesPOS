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
  InventoryTransfer,
  InventoryTransferRow,
  InventoryTransferWithItems,
  TransferStatus,
} from '../domain/inventory-transfer.interface';
import {
  CreateTransferData,
  TransferItemInput,
  TransferQuery,
} from '../domain/inventory-transfer.types';
import { InventoryTransferMapper } from '../mappers/inventory-transfer.mapper';
import { INVENTORY_TRANSFERS_REPOSITORY } from '../repositories/inventory-transfers.repository.interface';
import type { IInventoryTransfersRepository } from '../repositories/inventory-transfers.repository.interface';

@Injectable()
export class InventoryTransfersService {
  constructor(
    @Inject(INVENTORY_TRANSFERS_REPOSITORY)
    private readonly transfersRepository: IInventoryTransfersRepository,
    private readonly branchesService: BranchesService,
    private readonly inventoryItemsService: InventoryItemsService,
    private readonly movementsService: InventoryMovementsService,
    private readonly transactionService: TransactionService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    data: CreateTransferData,
    items: TransferItemInput[],
    actorUserId?: string,
  ): Promise<InventoryTransferWithItems> {
    if (items.length === 0) {
      throw new BusinessRuleException(
        'A transfer must include at least one item',
        'TRANSFER_EMPTY',
      );
    }
    if (
      data.fromBranchId === data.toBranchId &&
      (data.fromLocationId ?? null) === (data.toLocationId ?? null)
    ) {
      throw new BusinessRuleException(
        'Source and destination must differ (branch or location)',
        'TRANSFER_SAME_SOURCE_DESTINATION',
      );
    }

    await this.branchesService.findOne(data.businessId, data.fromBranchId);
    await this.branchesService.findOne(data.businessId, data.toBranchId);

    const uniqueIds = new Set(items.map((item) => item.inventoryItemId));
    if (uniqueIds.size !== items.length) {
      throw new BusinessRuleException(
        'An inventory item cannot appear more than once in the same transfer',
        'DUPLICATE_TRANSFER_ITEM',
      );
    }
    for (const item of items) {
      await this.inventoryItemsService.getOwnedOrFail(
        data.businessId,
        item.inventoryItemId,
      );
    }

    const row = await this.transactionService.execute(async (client) => {
      const created = await this.transfersRepository.create(
        data,
        actorUserId,
        client,
      );
      await this.transfersRepository.addItems(created.id, items, client);
      return created;
    });

    await this.auditService.record({
      businessId: data.businessId,
      branchId: data.fromBranchId,
      userId: actorUserId,
      entityType: 'inventory_transfer',
      entityId: row.id,
      action: 'CREATE',
      newValues: {
        fromBranchId: data.fromBranchId,
        toBranchId: data.toBranchId,
        itemCount: items.length,
      },
    });

    return this.buildWithItems(row);
  }

  async findAll(
    query: TransferQuery,
  ): Promise<PaginatedResult<InventoryTransfer>> {
    const { rows, total } = await this.transfersRepository.findAll(query);
    return {
      data: rows.map((row) => InventoryTransferMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findOne(
    businessId: string,
    id: string,
  ): Promise<InventoryTransferWithItems> {
    const row = await this.getOwnedOrFail(businessId, id);
    return this.buildWithItems(row);
  }

  async complete(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<InventoryTransferWithItems> {
    const transfer = await this.getOwnedOrFail(businessId, id);
    this.assertTransition(transfer.status, TransferStatus.COMPLETED);

    const items = await this.transfersRepository.findItems(transfer.id);

    const updated = await this.transactionService.execute(async (client) => {
      for (const item of items) {
        await this.movementsService.recordMovement(
          {
            businessId,
            branchId: transfer.from_branch_id,
            locationId: transfer.from_location_id ?? undefined,
            inventoryItemId: item.inventory_item_id,
            movementType: InventoryMovementType.TRANSFER_OUT,
            quantity: parseFloat(item.quantity),
            referenceType: 'inventory_transfer',
            referenceId: transfer.id,
            createdBy: actorUserId,
          },
          client,
        );
        await this.movementsService.recordMovement(
          {
            businessId,
            branchId: transfer.to_branch_id,
            locationId: transfer.to_location_id ?? undefined,
            inventoryItemId: item.inventory_item_id,
            movementType: InventoryMovementType.TRANSFER_IN,
            quantity: parseFloat(item.quantity),
            referenceType: 'inventory_transfer',
            referenceId: transfer.id,
            createdBy: actorUserId,
          },
          client,
        );
      }

      const row = await this.transfersRepository.setStatus(
        transfer.id,
        businessId,
        TransferStatus.COMPLETED,
        actorUserId,
        client,
      );
      if (!row) {
        throw new EntityNotFoundException('InventoryTransfer', transfer.id);
      }
      return row;
    });

    await this.auditService.record({
      businessId,
      branchId: transfer.to_branch_id,
      userId: actorUserId,
      entityType: 'inventory_transfer',
      entityId: transfer.id,
      action: 'COMPLETE',
    });

    return this.buildWithItems(updated);
  }

  async cancel(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<InventoryTransfer> {
    const transfer = await this.getOwnedOrFail(businessId, id);
    this.assertTransition(transfer.status, TransferStatus.CANCELLED);

    const row = await this.transfersRepository.setStatus(
      transfer.id,
      businessId,
      TransferStatus.CANCELLED,
      actorUserId,
    );
    if (!row) {
      throw new EntityNotFoundException('InventoryTransfer', id);
    }

    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'inventory_transfer',
      entityId: id,
      action: 'CANCEL',
    });

    return InventoryTransferMapper.toDomain(row);
  }

  private assertTransition(from: TransferStatus, to: TransferStatus): void {
    const allowed: Record<TransferStatus, TransferStatus[]> = {
      [TransferStatus.PENDING]: [
        TransferStatus.COMPLETED,
        TransferStatus.CANCELLED,
      ],
      [TransferStatus.COMPLETED]: [],
      [TransferStatus.CANCELLED]: [],
    };
    if (!allowed[from].includes(to)) {
      throw new BusinessRuleException(
        `Cannot transition transfer from ${from} to ${to}`,
        'TRANSFER_INVALID_STATUS_TRANSITION',
      );
    }
  }

  private async buildWithItems(
    row: InventoryTransferRow,
  ): Promise<InventoryTransferWithItems> {
    const itemRows = await this.transfersRepository.findItems(row.id);
    return {
      ...InventoryTransferMapper.toDomain(row),
      items: itemRows.map((itemRow) =>
        InventoryTransferMapper.itemToDomain(itemRow),
      ),
    };
  }

  private async getOwnedOrFail(
    businessId: string,
    id: string,
  ): Promise<InventoryTransferRow> {
    const row = await this.transfersRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('InventoryTransfer', id);
    }
    return row;
  }
}
