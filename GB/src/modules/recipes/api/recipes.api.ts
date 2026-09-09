import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse } from '../../../lib/api/api-types';
import type { CreateRecipePayload, Recipe, RecipeItemInput } from '../types/recipe.types';

export const recipesApi = {
  async getByProduct(productId: string): Promise<Recipe> {
    const { data } = await apiClient.get<ApiResponse<Recipe>>(`/products/${productId}/recipe`);
    return data.data;
  },

  async create(productId: string, payload: CreateRecipePayload): Promise<Recipe> {
    const { data } = await apiClient.post<ApiResponse<Recipe>>(
      `/products/${productId}/recipe`,
      payload,
    );
    return data.data;
  },

  async setItems(productId: string, items: RecipeItemInput[]): Promise<Recipe> {
    const { data } = await apiClient.put<ApiResponse<Recipe>>(
      `/products/${productId}/recipe/items`,
      { items },
    );
    return data.data;
  },

  async remove(productId: string): Promise<void> {
    await apiClient.delete(`/products/${productId}/recipe`);
  },
};
