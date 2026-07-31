export interface CreateInventoryLocationData {
  branchId: string;
  name: string;
  description?: string;
}

export interface UpdateInventoryLocationData {
  name?: string;
  description?: string;
}

export interface InventoryLocationQuery {
  branchId: string;
  page: number;
  limit: number;
  isActive?: boolean;
}
