import { DbClient } from '../../../database/types/database.types';
import { RecipeItemDetailRow, RecipeRow } from '../domain/recipe.interface';
import {
  CreateRecipeData,
  RecipeItemInput,
  UpdateRecipeData,
} from '../domain/recipe.types';

export interface IRecipesRepository {
  create(data: CreateRecipeData, client?: DbClient): Promise<RecipeRow>;
  findByProductId(
    productId: string,
    businessId: string,
    client?: DbClient,
  ): Promise<RecipeRow | null>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<RecipeRow | null>;
  update(
    id: string,
    businessId: string,
    data: UpdateRecipeData,
    client?: DbClient,
  ): Promise<RecipeRow | null>;
  delete(id: string, businessId: string, client?: DbClient): Promise<boolean>;
  findItemsWithDetails(
    recipeId: string,
    client?: DbClient,
  ): Promise<RecipeItemDetailRow[]>;
  replaceItems(
    recipeId: string,
    items: RecipeItemInput[],
    client?: DbClient,
  ): Promise<void>;
  getTotalCost(recipeId: string, client?: DbClient): Promise<number>;
}

export const RECIPES_REPOSITORY = Symbol('RECIPES_REPOSITORY');
