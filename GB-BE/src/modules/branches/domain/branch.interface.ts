/**
 * Whether an order created at this branch must be fully paid before it can
 * be sent to kitchen (GOL-27). Orders copy this value at creation time —
 * see orders.payment_policy — so changing it here never retroactively
 * affects an order already in flight.
 */
export enum PaymentPolicy {
  PREPAY_REQUIRED = 'PREPAY_REQUIRED',
  PAY_AT_END = 'PAY_AT_END',
}

export interface Branch {
  id: string;
  businessId: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  tableCount: number;
  isActive: boolean;
  paymentPolicy: PaymentPolicy;
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchRow {
  id: string;
  business_id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  table_count: number;
  is_active: boolean;
  payment_policy: PaymentPolicy;
  created_at: Date;
  updated_at: Date;
}
