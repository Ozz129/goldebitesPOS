import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryQueryApi } from '../api/inventory-query.api';
import { inventoryKeys } from '../api/inventory.keys';
import type { CreateInventoryQueryTemplatePayload } from '../types/inventory-query.types';

export function useSaveInventoryQueryTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInventoryQueryTemplatePayload) => inventoryQueryApi.createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.queryTemplates() });
    },
  });
}
