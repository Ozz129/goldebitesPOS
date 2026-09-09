import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recipesApi } from '../api/recipes.api';
import { recipeKeys } from '../api/recipes.keys';
import { productKeys } from '../../products/api/products.keys';
import type { RecipeItemInput } from '../types/recipe.types';

export function useSetRecipeItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, items }: { productId: string; items: RecipeItemInput[] }) =>
      recipesApi.setItems(productId, items),
    onSuccess: (_data, { productId }) => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.byProduct(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
