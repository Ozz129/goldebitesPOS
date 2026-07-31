export interface CreateBranchData {
  businessId: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
}

export interface UpdateBranchData {
  name?: string;
  address?: string;
  city?: string;
  phone?: string;
}

export interface BranchQuery {
  businessId: string;
  page: number;
  limit: number;
  isActive?: boolean;
  search?: string;
}
