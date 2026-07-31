import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryItemCategoriesApi } from '../api/inventory-item-categories.api';
import { inventoryItemCategoryKeys } from '../api/inventory-item-categories.keys';

export function useSetInventoryItemCategoryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      inventoryItemCategoriesApi.setCategoryStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryItemCategoryKeys.lists() });
    },
  });
}
