import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventory.api';
import { inventoryKeys } from '../api/inventory.keys';

export function useSetInventoryItemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      inventoryApi.setItemStatus(id, isActive),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.itemDetail(item.id) });
    },
  });
}
