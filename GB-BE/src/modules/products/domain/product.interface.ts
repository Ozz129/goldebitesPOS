export interface Product {
  id: string;
  businessId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  sku: string | null;
  salePrice: number;
  currentCost: number;
  imageUrl: string | null;
  isActive: boolean;
  trackInventory: boolean;
  maxSauces: number;
  maxSides: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductRow {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  sku: string | null;
  sale_price: string;
  current_cost: string;
  image_url: string | null;
  is_active: boolean;
  track_inventory: boolean;
  max_sauces: number;
  max_sides: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ProductMargin {
  salePrice: number;
  currentCost: number;
  marginAmount: number;
  marginPercent: number;
}
