export interface Branch {
  id: string;
  businessId: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BranchFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}
