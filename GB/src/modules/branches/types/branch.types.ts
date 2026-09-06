export interface Branch {
  id: string;
  businessId: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  tableCount: number;
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

export interface UpdateBranchPayload {
  name?: string;
  address?: string;
  city?: string;
  phone?: string;
  tableCount?: number;
}
