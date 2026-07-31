import {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderItemRow,
  PurchaseOrderRow,
} from '../domain/purchase-order.interface';

export class PurchaseOrderMapper {
  static toDomain(row: PurchaseOrderRow): PurchaseOrder {
    return {
      id: row.id,
      businessId: row.business_id,
      branchId: row.branch_id,
      supplierId: row.supplier_id,
      orderNumber: row.order_number,
      status: row.status,
      orderDate: row.order_date,
      expectedDate: row.expected_date,
      subtotal: parseFloat(row.subtotal),
      taxAmount: parseFloat(row.tax_amount),
      totalAmount: parseFloat(row.total_amount),
      notes: row.notes,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static itemToDomain(row: PurchaseOrderItemRow): PurchaseOrderItem {
    return {
      id: row.id,
      purchaseOrderId: row.purchase_order_id,
      inventoryItemId: row.inventory_item_id,
      inventoryItemName: row.inventory_item_name,
      unit: row.unit,
      quantity: parseFloat(row.quantity),
      unitCost: parseFloat(row.unit_cost),
      totalCost: parseFloat(row.total_cost),
      receivedQuantity: parseFloat(row.received_quantity),
    };
  }
}
