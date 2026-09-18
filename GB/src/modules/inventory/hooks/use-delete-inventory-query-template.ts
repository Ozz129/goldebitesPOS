import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryQueryApi } from '../api/inventory-query.api';
import { inventoryKeys } from '../api/inventory.keys';

export function useDeleteInventoryQueryTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryQueryApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.queryTemplates() });
    },
  });
}
