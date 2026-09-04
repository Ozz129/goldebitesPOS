import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productCategoriesApi } from '../api/product-categories.api';
import { productCategoryKeys } from '../api/product-categories.keys';

export function useSetProductCategoryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      productCategoriesApi.setCategoryStatus(id, isActive),
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: productCategoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productCategoryKeys.detail(category.id) });
    },
  });
}
