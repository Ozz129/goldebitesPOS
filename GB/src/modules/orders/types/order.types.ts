export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'CAR_SERVICE';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderPaymentStatus = 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  productNameSnapshot: string;
  quantity: number;
  unitPrice: number;
  unitCostSnapshot: number;
  discountAmount: number;
  totalPrice: number;
  notes: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  businessId: string;
  branchId: string;
  customerId: string | null;
  createdBy: string | null;
  orderNumber: number;
  orderType: OrderType;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  tableNumber: string | null;
  deliveryAddress: string | null;
  deliveryInstructions: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  notes: string | null;
  confirmedAt: string | null;
  preparedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface CreateOrderItemPayload {
  productId: string;
  quantity: number;
  discountAmount?: number;
  notes?: string;
}

export interface CreateOrderPayload {
  branchId: string;
  customerId?: string;
  orderType: OrderType;
  tableNumber?: string;
  deliveryAddress?: string;
  deliveryInstructions?: string;
  discountAmount?: number;
  deliveryFee?: number;
  notes?: string;
  items: CreateOrderItemPayload[];
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  branchId?: string;
  status?: OrderStatus;
  orderType?: OrderType;
  customerId?: string;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
}
