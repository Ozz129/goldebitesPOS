import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { recipesApi } from '../api/recipes.api';
import { recipeKeys } from '../api/recipes.keys';

/** A 404 here means "this product has no recipe/inventory link yet", not a real error. */
export function useProductRecipe(productId: string | null) {
  const query = useQuery({
    queryKey: recipeKeys.byProduct(productId ?? ''),
    queryFn: () => recipesApi.getByProduct(productId as string),
    enabled: Boolean(productId),
    retry: false,
  });

  const isNotFound = query.error instanceof AxiosError && query.error.response?.status === 404;

  return { ...query, isError: query.isError && !isNotFound, hasNoRecipe: isNotFound };
}
