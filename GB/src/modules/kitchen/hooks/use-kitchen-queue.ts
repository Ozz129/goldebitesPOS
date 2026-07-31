import { useQuery } from '@tanstack/react-query';
import { kitchenApi } from '../api/kitchen.api';
import { kitchenKeys } from '../api/kitchen.keys';

export function useKitchenQueue(branchId?: string) {
  return useQuery({
    queryKey: kitchenKeys.queue(branchId),
    queryFn: () => kitchenApi.getQueue(branchId),
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}
