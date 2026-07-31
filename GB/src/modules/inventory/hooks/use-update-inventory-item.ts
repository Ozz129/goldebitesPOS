import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventory.api';
import { inventoryKeys } from '../api/inventory.keys';
import type { UpdateInventoryItemPayload } from '../types/inventory.types';

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateInventoryItemPayload }) =>
      inventoryApi.updateItem(id, payload),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.itemDetail(item.id) });
    },
  });
}
