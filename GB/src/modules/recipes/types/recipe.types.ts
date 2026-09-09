export interface RecipeItem {
  id: string;
  recipeId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  unit: string;
  quantity: number;
  unitCost: number;
  lineCost: number;
  createdAt: string;
}

export interface RecipeCost {
  totalCost: number;
  costPerPortion: number;
  yieldQuantity: number;
}

export interface Recipe {
  id: string;
  businessId: string;
  productId: string;
  name: string;
  yieldQuantity: number;
  instructions: string | null;
  items: RecipeItem[];
  cost: RecipeCost;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeItemInput {
  inventoryItemId: string;
  quantity: number;
}

export interface CreateRecipePayload {
  name?: string;
  yieldQuantity?: number;
  instructions?: string;
  items?: RecipeItemInput[];
}
