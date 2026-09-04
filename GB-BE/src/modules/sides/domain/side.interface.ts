export interface Side {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SideRow {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
