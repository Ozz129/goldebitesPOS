export interface CreateRecipeData {
  businessId: string;
  productId: string;
  /** Defaults to the product's own name when omitted. */
  name?: string;
  yieldQuantity?: number;
  instructions?: string;
}

export interface UpdateRecipeData {
  name?: string;
  yieldQuantity?: number;
  instructions?: string;
}

export interface RecipeItemInput {
  inventoryItemId: string;
  quantity: number;
}
