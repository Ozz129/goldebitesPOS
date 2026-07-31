import { DbClient } from '../../../database/types/database.types';
import {
  PurchaseOrderItemRow,
  PurchaseOrderRow,
  PurchaseOrderStatus,
} from '../domain/purchase-order.interface';
import {
  CreatePurchaseOrderData,
  PurchaseOrderItemInput,
  PurchaseOrderQuery,
} from '../domain/purchase-order.types';

export interface IPurchaseOrdersRepository {
  create(
    data: CreatePurchaseOrderData,
    createdBy: string | undefined,
    client?: DbClient,
  ): Promise<PurchaseOrderRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<PurchaseOrderRow | null>;
  findAll(
    query: PurchaseOrderQuery,
  ): Promise<{ rows: PurchaseOrderRow[]; total: number }>;
  addItems(
    purchaseOrderId: string,
    items: PurchaseOrderItemInput[],
    client?: DbClient,
  ): Promise<void>;
  findItems(
    purchaseOrderId: string,
    client?: DbClient,
  ): Promise<PurchaseOrderItemRow[]>;
  findItemById(
    itemId: string,
    client?: DbClient,
  ): Promise<PurchaseOrderItemRow | null>;
  updateTotals(
    id: string,
    subtotal: number,
    taxAmount: number,
    totalAmount: number,
    client?: DbClient,
  ): Promise<void>;
  setStatus(
    id: string,
    businessId: string,
    status: PurchaseOrderStatus,
    client?: DbClient,
  ): Promise<PurchaseOrderRow | null>;
  hasReceipts(purchaseOrderId: string, client?: DbClient): Promise<boolean>;
}

export const PURCHASE_ORDERS_REPOSITORY = Symbol('PURCHASE_ORDERS_REPOSITORY');
