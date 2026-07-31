export interface Recipe {
  id: string;
  businessId: string;
  productId: string;
  name: string;
  yieldQuantity: number;
  instructions: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeRow {
  id: string;
  business_id: string;
  product_id: string;
  name: string;
  yield_quantity: string;
  instructions: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface RecipeItem {
  id: string;
  recipeId: string;
  inventoryItemId: string;
  quantity: number;
  createdAt: Date;
}

export interface RecipeItemDetailRow {
  id: string;
  recipe_id: string;
  inventory_item_id: string;
  quantity: string;
  created_at: Date;
  inventory_item_name: string;
  unit: string;
  unit_cost: string;
}

export interface RecipeItemDetail extends RecipeItem {
  inventoryItemName: string;
  unit: string;
  unitCost: number;
  lineCost: number;
}

export interface RecipeCost {
  totalCost: number;
  costPerPortion: number;
  yieldQuantity: number;
}

export interface RecipeWithItems extends Recipe {
  items: RecipeItemDetail[];
  cost: RecipeCost;
}
