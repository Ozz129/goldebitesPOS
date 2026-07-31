export interface InventoryLocation {
  id: string;
  branchId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface InventoryLocationRow {
  id: string;
  branch_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
}
