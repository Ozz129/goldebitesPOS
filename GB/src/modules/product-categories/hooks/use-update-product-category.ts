import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productCategoriesApi } from '../api/product-categories.api';
import { productCategoryKeys } from '../api/product-categories.keys';
import type { UpdateProductCategoryPayload } from '../types/product-category.types';

export function useUpdateProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductCategoryPayload }) =>
      productCategoriesApi.updateCategory(id, payload),
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: productCategoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productCategoryKeys.detail(category.id) });
    },
  });
}
