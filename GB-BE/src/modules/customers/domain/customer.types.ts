export interface CreateCustomerData {
  businessId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  documentNumber?: string;
  birthDate?: string;
  notes?: string;
}

export interface UpdateCustomerData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  documentNumber?: string;
  birthDate?: string;
  notes?: string;
}

export interface CustomerQuery {
  businessId: string;
  page: number;
  limit: number;
  search?: string;
}

export interface CreateCustomerAddressData {
  label?: string;
  address: string;
  city?: string;
  instructions?: string;
  isDefault?: boolean;
}
