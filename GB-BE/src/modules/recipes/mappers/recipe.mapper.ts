import {
  Recipe,
  RecipeItemDetail,
  RecipeItemDetailRow,
  RecipeRow,
} from '../domain/recipe.interface';

export class RecipeMapper {
  static toDomain(row: RecipeRow): Recipe {
    return {
      id: row.id,
      businessId: row.business_id,
      productId: row.product_id,
      name: row.name,
      yieldQuantity: parseFloat(row.yield_quantity),
      instructions: row.instructions,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static itemToDomain(row: RecipeItemDetailRow): RecipeItemDetail {
    const quantity = parseFloat(row.quantity);
    const unitCost = parseFloat(row.unit_cost);
    return {
      id: row.id,
      recipeId: row.recipe_id,
      inventoryItemId: row.inventory_item_id,
      quantity,
      createdAt: row.created_at,
      inventoryItemName: row.inventory_item_name,
      unit: row.unit,
      unitCost,
      lineCost: Math.round(quantity * unitCost * 100) / 100,
    };
  }
}
