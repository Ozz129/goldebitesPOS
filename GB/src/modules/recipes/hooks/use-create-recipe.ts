import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recipesApi } from '../api/recipes.api';
import { recipeKeys } from '../api/recipes.keys';
import { productKeys } from '../../products/api/products.keys';
import type { CreateRecipePayload } from '../types/recipe.types';

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: CreateRecipePayload }) =>
      recipesApi.create(productId, payload),
    onSuccess: (_data, { productId }) => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.byProduct(productId) });
      // The recipe's cost gets synced onto the product's currentCost server-side.
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
