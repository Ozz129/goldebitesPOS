import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productCategoriesApi } from '../api/product-categories.api';
import { productCategoryKeys } from '../api/product-categories.keys';
import type { CreateProductCategoryPayload } from '../types/product-category.types';

export function useCreateProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductCategoryPayload) =>
      productCategoriesApi.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCategoryKeys.lists() });
    },
  });
}
