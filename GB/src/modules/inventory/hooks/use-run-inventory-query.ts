import { useMutation } from '@tanstack/react-query';
import { inventoryQueryApi } from '../api/inventory-query.api';
import type { RunInventoryQueryPayload } from '../types/inventory-query.types';

export function useRunInventoryQuery() {
  return useMutation({
    mutationFn: (payload: RunInventoryQueryPayload) => inventoryQueryApi.runQuery(payload),
  });
}
