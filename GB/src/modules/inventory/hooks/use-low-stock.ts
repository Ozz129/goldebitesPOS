import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventory.api';
import { inventoryKeys } from '../api/inventory.keys';

export function useLowStock(branchId?: string) {
  return useQuery({
    queryKey: inventoryKeys.lowStock(branchId),
    queryFn: () => inventoryApi.getLowStock(branchId),
    staleTime: 30_000,
  });
}
