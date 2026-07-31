import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { DbClient } from '../../../database/types/database.types';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { TransactionService } from '../../../database/transaction.service';
import { AuditService } from '../../audit/services/audit.service';
import { BranchesService } from '../../branches/services/branches.service';
import { BusinessesService } from '../../businesses/services/businesses.service';
import { InventoryItemsService } from '../../inventory-items/services/inventory-items.service';
import { SuppliersService } from '../../suppliers/services/suppliers.service';
import {
  PurchaseOrder,
  PurchaseOrderRow,
  PurchaseOrderStatus,
  PurchaseOrderWithItems,
} from '../domain/purchase-order.interface';
import {
  CreatePurchaseOrderData,
  PurchaseOrderItemInput,
  PurchaseOrderQuery,
} from '../domain/purchase-order.types';
import { PurchaseOrderMapper } from '../mappers/purchase-order.mapper';
import { PURCHASE_ORDERS_REPOSITORY } from '../repositories/purchase-orders.repository.interface';
import type { IPurchaseOrdersRepository } from '../repositories/purchase-orders.repository.interface';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @Inject(PURCHASE_ORDERS_REPOSITORY)
    private readonly ordersRepository: IPurchaseOrdersRepository,
    private readonly branchesService: BranchesService,
    private readonly suppliersService: SuppliersService,
    private readonly inventoryItemsService: InventoryItemsService,
    private readonly businessesService: BusinessesService,
    private readonly transactionService: TransactionService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    data: CreatePurchaseOrderData,
    items: PurchaseOrderItemInput[],
    actorUserId?: string,
  ): Promise<PurchaseOrderWithItems> {
    if (items.length === 0) {
      throw new BusinessRuleException(
        'A purchase order must include at least one item',
        'PO_EMPTY',
      );
    }

    await this.branchesService.findOne(data.businessId, data.branchId);
    await this.suppliersService.findOne(data.businessId, data.supplierId);

    const uniqueIds = new Set(items.map((item) => item.inventoryItemId));
    if (uniqueIds.size !== items.length) {
      throw new BusinessRuleException(
        'An inventory item cannot appear more than once in the same purchase order',
        'DUPLICATE_PO_ITEM',
      );
    }
    for (const item of items) {
      await this.inventoryItemsService.getOwnedOrFail(
        data.businessId,
        item.inventoryItemId,
      );
    }

    const taxRate = await this.businessesService.getTaxRate(data.businessId);
    const subtotal = round2(
      items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0),
    );
    const taxAmount = round2(subtotal * taxRate);
    const totalAmount = round2(subtotal + taxAmount);

    const row = await this.transactionService.execute(async (client) => {
      const created = await this.ordersRepository.create(
        data,
        actorUserId,
        client,
      );
      await this.ordersRepository.addItems(created.id, items, client);
      await this.ordersRepository.updateTotals(
        created.id,
        subtotal,
        taxAmount,
        totalAmount,
        client,
      );
      return {
        ...created,
        subtotal: String(subtotal),
        tax_amount: String(taxAmount),
        total_amount: String(totalAmount),
      };
    });

    await this.auditService.record({
      businessId: data.businessId,
      branchId: data.branchId,
      userId: actorUserId,
      entityType: 'purchase_order',
      entityId: row.id,
      action: 'CREATE',
      newValues: { orderNumber: row.order_number, totalAmount },
    });

    return this.buildWithItems(row);
  }

  async findAll(
    query: PurchaseOrderQuery,
  ): Promise<PaginatedResult<PurchaseOrder>> {
    const { rows, total } = await this.ordersRepository.findAll(query);
    return {
      data: rows.map((row) => PurchaseOrderMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findOne(
    businessId: string,
    id: string,
  ): Promise<PurchaseOrderWithItems> {
    const row = await this.getOwnedOrFail(businessId, id);
    return this.buildWithItems(row);
  }

  async submit(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<PurchaseOrder> {
    return this.transition(
      businessId,
      id,
      PurchaseOrderStatus.DRAFT,
      PurchaseOrderStatus.SUBMITTED,
      actorUserId,
    );
  }

  async approve(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<PurchaseOrder> {
    return this.transition(
      businessId,
      id,
      PurchaseOrderStatus.SUBMITTED,
      PurchaseOrderStatus.APPROVED,
      actorUserId,
    );
  }

  async cancel(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<PurchaseOrder> {
    const order = await this.getOwnedOrFail(businessId, id);

    const cancellableFrom: PurchaseOrderStatus[] = [
      PurchaseOrderStatus.DRAFT,
      PurchaseOrderStatus.SUBMITTED,
      PurchaseOrderStatus.APPROVED,
    ];
    if (!cancellableFrom.includes(order.status)) {
      throw new BusinessRuleException(
        `Cannot cancel a purchase order with status ${order.status}`,
        'PO_INVALID_STATUS_TRANSITION',
      );
    }

    if (order.status === PurchaseOrderStatus.APPROVED) {
      const hasReceipts = await this.ordersRepository.hasReceipts(order.id);
      if (hasReceipts) {
        throw new BusinessRuleException(
          'Cannot cancel an approved purchase order that already has goods receipts',
          'PO_HAS_RECEIPTS',
        );
      }
    }

    const row = await this.ordersRepository.setStatus(
      id,
      businessId,
      PurchaseOrderStatus.CANCELLED,
    );
    if (!row) {
      throw new EntityNotFoundException('PurchaseOrder', id);
    }

    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'purchase_order',
      entityId: id,
      action: 'CANCEL',
    });

    return PurchaseOrderMapper.toDomain(row);
  }

  /** Used by GoodsReceiptsService to validate a line item and know how much is still owed. */
  async getItemForReceipt(
    businessId: string,
    purchaseOrderId: string,
    purchaseOrderItemId: string,
  ): Promise<{
    inventoryItemId: string;
    quantity: number;
    receivedQuantity: number;
  }> {
    await this.getOwnedOrFail(businessId, purchaseOrderId);
    const item = await this.ordersRepository.findItemById(purchaseOrderItemId);
    if (!item || item.purchase_order_id !== purchaseOrderId) {
      throw new EntityNotFoundException(
        'PurchaseOrderItem',
        purchaseOrderItemId,
      );
    }
    return {
      inventoryItemId: item.inventory_item_id,
      quantity: parseFloat(item.quantity),
      receivedQuantity: parseFloat(item.received_quantity),
    };
  }

  /**
   * Used by GoodsReceiptsService: true once every line item is fully
   * received. Must run with the same transactional `client` as the receipt
   * that was just inserted, so the just-recorded quantities are visible.
   */
  async isFullyReceived(
    purchaseOrderId: string,
    client?: DbClient,
  ): Promise<boolean> {
    const items = await this.ordersRepository.findItems(
      purchaseOrderId,
      client,
    );
    return items.every(
      (item) => parseFloat(item.received_quantity) >= parseFloat(item.quantity),
    );
  }

  /** Used by GoodsReceiptsService after recording a receipt, inside the same transaction. */
  async syncStatusAfterReceipt(
    businessId: string,
    id: string,
    fullyReceived: boolean,
    client?: DbClient,
  ): Promise<void> {
    await this.ordersRepository.setStatus(
      id,
      businessId,
      fullyReceived
        ? PurchaseOrderStatus.RECEIVED
        : PurchaseOrderStatus.PARTIALLY_RECEIVED,
      client,
    );
  }

  private async transition(
    businessId: string,
    id: string,
    from: PurchaseOrderStatus,
    to: PurchaseOrderStatus,
    actorUserId?: string,
  ): Promise<PurchaseOrder> {
    const order = await this.getOwnedOrFail(businessId, id);
    if (order.status !== from) {
      throw new BusinessRuleException(
        `Cannot transition purchase order from ${order.status} to ${to}`,
        'PO_INVALID_STATUS_TRANSITION',
      );
    }

    const row = await this.ordersRepository.setStatus(id, businessId, to);
    if (!row) {
      throw new EntityNotFoundException('PurchaseOrder', id);
    }

    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'purchase_order',
      entityId: id,
      action: to,
    });

    return PurchaseOrderMapper.toDomain(row);
  }

  private async buildWithItems(
    row: PurchaseOrderRow,
  ): Promise<PurchaseOrderWithItems> {
    const itemRows = await this.ordersRepository.findItems(row.id);
    return {
      ...PurchaseOrderMapper.toDomain(row),
      items: itemRows.map((itemRow) =>
        PurchaseOrderMapper.itemToDomain(itemRow),
      ),
    };
  }

  private async getOwnedOrFail(
    businessId: string,
    id: string,
  ): Promise<PurchaseOrderRow> {
    const row = await this.ordersRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('PurchaseOrder', id);
    }
    return row;
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
