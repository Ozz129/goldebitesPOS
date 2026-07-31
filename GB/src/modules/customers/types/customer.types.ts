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
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  label: string | null;
  address: string;
  city: string | null;
  instructions: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateCustomerPayload {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  documentNumber?: string;
  birthDate?: string;
  notes?: string;
}

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

export interface CreateCustomerAddressPayload {
  label?: string;
  address: string;
  city?: string;
  instructions?: string;
  isDefault?: boolean;
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
}
