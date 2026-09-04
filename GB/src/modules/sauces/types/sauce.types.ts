export interface Sauce {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaucePayload {
  name: string;
  description?: string;
  displayOrder?: number;
}

export type UpdateSaucePayload = Partial<CreateSaucePayload>;

export interface SauceFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}
