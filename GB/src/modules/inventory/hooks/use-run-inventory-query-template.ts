import { useMutation } from '@tanstack/react-query';
import { inventoryQueryApi } from '../api/inventory-query.api';

export function useRunInventoryQueryTemplate() {
  return useMutation({
    mutationFn: ({ id, branchId }: { id: string; branchId?: string }) =>
      inventoryQueryApi.runTemplate(id, { branchId }),
  });
}
