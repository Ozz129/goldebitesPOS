export interface CreateSideData {
  businessId: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface UpdateSideData {
  name?: string;
  description?: string;
  displayOrder?: number;
}

export interface SideQuery {
  businessId: string;
  page: number;
  limit: number;
  isActive?: boolean;
  search?: string;
}
