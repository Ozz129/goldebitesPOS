import {
  GoodsReceipt,
  GoodsReceiptItem,
  GoodsReceiptItemRow,
  GoodsReceiptRow,
} from '../domain/goods-receipt.interface';

export class GoodsReceiptMapper {
  static toDomain(row: GoodsReceiptRow): GoodsReceipt {
    return {
      id: row.id,
      businessId: row.business_id,
      branchId: row.branch_id,
      purchaseOrderId: row.purchase_order_id,
      receivedBy: row.received_by,
      receivedAt: row.received_at,
      notes: row.notes,
    };
  }

  static itemToDomain(row: GoodsReceiptItemRow): GoodsReceiptItem {
    return {
      id: row.id,
      goodsReceiptId: row.goods_receipt_id,
      purchaseOrderItemId: row.purchase_order_item_id,
      inventoryItemId: row.inventory_item_id,
      inventoryItemName: row.inventory_item_name,
      quantityReceived: parseFloat(row.quantity_received),
      unitCost: parseFloat(row.unit_cost),
    };
  }
}
