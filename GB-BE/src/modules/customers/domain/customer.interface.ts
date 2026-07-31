export interface Customer {
  id: string;
  businessId: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  documentNumber: string | null;
  birthDate: string | null;
  notes: string | null;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CustomerRow {
  id: string;
  business_id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  document_number: string | null;
  birth_date: string | null;
  notes: string | null;
  total_orders: number;
  total_spent: string;
  loyalty_points: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  label: string | null;
  address: string;
  city: string | null;
  instructions: string | null;
  isDefault: boolean;
  createdAt: Date;
}

export interface CustomerAddressRow {
  id: string;
  customer_id: string;
  label: string | null;
  address: string;
  city: string | null;
  instructions: string | null;
  is_default: boolean;
  created_at: Date;
}
