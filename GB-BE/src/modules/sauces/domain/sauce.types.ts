export interface CreateSauceData {
  businessId: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface UpdateSauceData {
  name?: string;
  description?: string;
  displayOrder?: number;
}

export interface SauceQuery {
  businessId: string;
  page: number;
  limit: number;
  isActive?: boolean;
  search?: string;
}
