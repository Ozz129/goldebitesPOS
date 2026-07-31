import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryItemCategoriesApi } from '../api/inventory-item-categories.api';
import { inventoryItemCategoryKeys } from '../api/inventory-item-categories.keys';
import type { CreateInventoryItemCategoryPayload } from '../types/inventory-item-category.types';

export function useCreateInventoryItemCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInventoryItemCategoryPayload) =>
      inventoryItemCategoriesApi.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryItemCategoryKeys.lists() });
    },
  });
}
