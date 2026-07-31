import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { TransactionService } from '../../../database/transaction.service';
import { AuditService } from '../../audit/services/audit.service';
import { InventoryItemsService } from '../../inventory-items/services/inventory-items.service';
import { InventoryMovementType } from '../../inventory-movements/domain/inventory-movement.types';
import { InventoryMovementsService } from '../../inventory-movements/services/inventory-movements.service';
import { PurchaseOrderStatus } from '../../purchases/domain/purchase-order.interface';
import { PurchaseOrdersService } from '../../purchases/services/purchase-orders.service';
import {
  GoodsReceipt,
  GoodsReceiptRow,
  GoodsReceiptWithItems,
} from '../domain/goods-receipt.interface';
import {
  GoodsReceiptItemInput,
  GoodsReceiptQuery,
} from '../domain/goods-receipt.types';
import { GoodsReceiptMapper } from '../mappers/goods-receipt.mapper';
import { GOODS_RECEIPTS_REPOSITORY } from '../repositories/goods-receipts.repository.interface';
import type { IGoodsReceiptsRepository } from '../repositories/goods-receipts.repository.interface';

const RECEIVABLE_STATUSES: PurchaseOrderStatus[] = [
  PurchaseOrderStatus.APPROVED,
  PurchaseOrderStatus.PARTIALLY_RECEIVED,
];
const QUANTITY_EPSILON = 1e-9;

@Injectable()
export class GoodsReceiptsService {
  constructor(
    @Inject(GOODS_RECEIPTS_REPOSITORY)
    private readonly receiptsRepository: IGoodsReceiptsRepository,
    private readonly purchaseOrdersService: PurchaseOrdersService,
    private readonly inventoryItemsService: InventoryItemsService,
    private readonly movementsService: InventoryMovementsService,
    private readonly transactionService: TransactionService,
    private readonly auditService: AuditService,
  ) {}

  async receive(
    businessId: string,
    purchaseOrderId: string,
    items: GoodsReceiptItemInput[],
    notes: string | undefined,
    actorUserId?: string,
  ): Promise<GoodsReceiptWithItems> {
    if (items.length === 0) {
      throw new BusinessRuleException(
        'A goods receipt must include at least one item',
        'RECEIPT_EMPTY',
      );
    }

    const order = await this.purchaseOrdersService.findOne(
      businessId,
      purchaseOrderId,
    );
    if (!RECEIVABLE_STATUSES.includes(order.status)) {
      throw new BusinessRuleException(
        `Cannot receive goods for a purchase order with status ${order.status}`,
        'PO_NOT_RECEIVABLE',
      );
    }

    const uniqueIds = new Set(items.map((item) => item.purchaseOrderItemId));
    if (uniqueIds.size !== items.length) {
      throw new BusinessRuleException(
        'A purchase order item cannot appear more than once in the same receipt',
        'DUPLICATE_RECEIPT_ITEM',
      );
    }

    const enrichedItems: (GoodsReceiptItemInput & {
      inventoryItemId: string;
    })[] = [];
    for (const item of items) {
      const poItem = await this.purchaseOrdersService.getItemForReceipt(
        businessId,
        purchaseOrderId,
        item.purchaseOrderItemId,
      );
      const remaining = poItem.quantity - poItem.receivedQuantity;
      if (item.quantityReceived > remaining + QUANTITY_EPSILON) {
        throw new BusinessRuleException(
          `Cannot receive ${item.quantityReceived} units; only ${remaining} remain on the purchase order item`,
          'RECEIPT_EXCEEDS_ORDERED',
        );
      }
      enrichedItems.push({ ...item, inventoryItemId: poItem.inventoryItemId });
    }

    const row = await this.transactionService.execute(async (client) => {
      const created = await this.receiptsRepository.create(
        { businessId, branchId: order.branchId, purchaseOrderId, notes },
        actorUserId,
        client,
      );
      await this.receiptsRepository.addItems(created.id, enrichedItems, client);

      for (const item of enrichedItems) {
        await this.movementsService.recordMovement(
          {
            businessId,
            branchId: order.branchId,
            inventoryItemId: item.inventoryItemId,
            movementType: InventoryMovementType.PURCHASE,
            quantity: item.quantityReceived,
            unitCost: item.unitCost,
            referenceType: 'goods_receipt',
            referenceId: created.id,
            createdBy: actorUserId,
          },
          client,
        );
        await this.inventoryItemsService.syncCostFromPurchase(
          businessId,
          item.inventoryItemId,
          item.unitCost,
          client,
        );
      }

      const fullyReceived = await this.purchaseOrdersService.isFullyReceived(
        purchaseOrderId,
        client,
      );
      await this.purchaseOrdersService.syncStatusAfterReceipt(
        businessId,
        purchaseOrderId,
        fullyReceived,
        client,
      );

      return created;
    });

    await this.auditService.record({
      businessId,
      branchId: order.branchId,
      userId: actorUserId,
      entityType: 'goods_receipt',
      entityId: row.id,
      action: 'CREATE',
      newValues: { purchaseOrderId, itemCount: enrichedItems.length },
    });

    return this.buildWithItems(row);
  }

  async findAll(
    query: GoodsReceiptQuery,
  ): Promise<PaginatedResult<GoodsReceipt>> {
    const { rows, total } = await this.receiptsRepository.findAll(query);
    return {
      data: rows.map((row) => GoodsReceiptMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findOne(
    businessId: string,
    id: string,
  ): Promise<GoodsReceiptWithItems> {
    const row = await this.getOwnedOrFail(businessId, id);
    return this.buildWithItems(row);
  }

  private async buildWithItems(
    row: GoodsReceiptRow,
  ): Promise<GoodsReceiptWithItems> {
    const itemRows = await this.receiptsRepository.findItems(row.id);
    return {
      ...GoodsReceiptMapper.toDomain(row),
      items: itemRows.map((itemRow) =>
        GoodsReceiptMapper.itemToDomain(itemRow),
      ),
    };
  }

  private async getOwnedOrFail(
    businessId: string,
    id: string,
  ): Promise<GoodsReceiptRow> {
    const row = await this.receiptsRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('GoodsReceipt', id);
    }
    return row;
  }
}
