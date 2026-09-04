export interface Side {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSidePayload {
  name: string;
  description?: string;
  displayOrder?: number;
}

export type UpdateSidePayload = Partial<CreateSidePayload>;

export interface SideFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}
