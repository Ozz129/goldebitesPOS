export interface CreateBranchData {
  businessId: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  tableCount?: number;
}

export interface UpdateBranchData {
  name?: string;
  address?: string;
  city?: string;
  phone?: string;
  tableCount?: number;
}

export interface BranchQuery {
  businessId: string;
  page: number;
  limit: number;
  isActive?: boolean;
  search?: string;
}
