import { DbClient } from '../../../database/types/database.types';
import {
  DailySalesRow,
  OrderItemRow,
  OrderRow,
  OrderStatus,
  OrderStatusHistoryRow,
  SalesSummaryRow,
  TopProductRow,
} from '../domain/order.interface';
import {
  CreateOrderData,
  OrderItemComputed,
  OrderQuery,
} from '../domain/order.types';

export interface IOrdersRepository {
  create(
    data: CreateOrderData,
    createdBy: string | undefined,
    client?: DbClient,
  ): Promise<OrderRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<OrderRow | null>;
  findAll(query: OrderQuery): Promise<{ rows: OrderRow[]; total: number }>;
  findActiveForKitchen(
    businessId: string,
    branchId?: string,
  ): Promise<OrderRow[]>;
  addItems(
    orderId: string,
    items: OrderItemComputed[],
    client?: DbClient,
  ): Promise<void>;
  replaceItems(
    orderId: string,
    items: OrderItemComputed[],
    client?: DbClient,
  ): Promise<void>;
  findItems(orderId: string, client?: DbClient): Promise<OrderItemRow[]>;
  updateTotals(
    orderId: string,
    subtotal: number,
    discountAmount: number,
    taxAmount: number,
    deliveryFee: number,
    totalAmount: number,
    client?: DbClient,
  ): Promise<void>;
  setStatus(
    id: string,
    businessId: string,
    status: OrderStatus,
    timestampColumn: string | null,
    client?: DbClient,
  ): Promise<OrderRow | null>;
  updatePaymentStatus(
    id: string,
    paymentStatus: string,
    client?: DbClient,
  ): Promise<void>;
  addStatusHistory(
    orderId: string,
    previousStatus: OrderStatus | null,
    newStatus: OrderStatus,
    changedBy: string | undefined,
    notes: string | undefined,
    client?: DbClient,
  ): Promise<OrderStatusHistoryRow>;
  findStatusHistory(orderId: string): Promise<OrderStatusHistoryRow[]>;
  getActiveCount(businessId: string, branchId?: string): Promise<number>;
  getSalesSummary(
    businessId: string,
    branchId: string | undefined,
    dateFrom: string,
    dateTo: string,
  ): Promise<SalesSummaryRow>;
  getSalesByDay(
    businessId: string,
    branchId: string | undefined,
    dateFrom: string,
    dateTo: string,
  ): Promise<DailySalesRow[]>;
  getTopProducts(
    businessId: string,
    branchId: string | undefined,
    dateFrom: string,
    dateTo: string,
    limit: number,
  ): Promise<TopProductRow[]>;
}

export const ORDERS_REPOSITORY = Symbol('ORDERS_REPOSITORY');
