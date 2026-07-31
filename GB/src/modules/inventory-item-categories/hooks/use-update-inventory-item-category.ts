import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryItemCategoriesApi } from '../api/inventory-item-categories.api';
import { inventoryItemCategoryKeys } from '../api/inventory-item-categories.keys';
import type { UpdateInventoryItemCategoryPayload } from '../types/inventory-item-category.types';

export function useUpdateInventoryItemCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateInventoryItemCategoryPayload }) =>
      inventoryItemCategoriesApi.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryItemCategoryKeys.lists() });
    },
  });
}
