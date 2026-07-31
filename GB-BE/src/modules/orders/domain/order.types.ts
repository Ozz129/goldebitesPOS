import { OrderStatus, OrderType } from './order.interface';

export interface OrderItemInput {
  productId: string;
  quantity: number;
  discountAmount?: number;
  notes?: string;
}

export interface CreateOrderData {
  businessId: string;
  branchId: string;
  customerId?: string;
  orderType: OrderType;
  tableNumber?: string;
  deliveryAddress?: string;
  deliveryInstructions?: string;
  discountAmount?: number;
  deliveryFee?: number;
  notes?: string;
}

export interface OrderQuery {
  businessId: string;
  page: number;
  limit: number;
  branchId?: string;
  status?: OrderStatus;
  orderType?: OrderType;
  customerId?: string;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface OrderItemComputed extends OrderItemInput {
  productNameSnapshot: string;
  unitPrice: number;
  unitCostSnapshot: number;
  totalPrice: number;
}
