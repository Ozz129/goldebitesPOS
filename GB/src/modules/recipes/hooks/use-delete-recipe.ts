import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recipesApi } from '../api/recipes.api';
import { recipeKeys } from '../api/recipes.keys';
import { productKeys } from '../../products/api/products.keys';

export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => recipesApi.remove(productId),
    onSuccess: (_data, productId) => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.byProduct(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
