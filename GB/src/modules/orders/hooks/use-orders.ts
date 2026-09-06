import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { orderKeys } from '../api/orders.keys';
import type { OrderFilters } from '../types/order.types';

interface UseOrdersOptions {
  refetchInterval?: number;
  enabled?: boolean;
}

export function useOrders(filters: OrderFilters = {}, options: UseOrdersOptions = {}) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => ordersApi.getOrders(filters),
    staleTime: 15_000,
    refetchInterval: options.refetchInterval ?? 30_000,
    enabled: options.enabled ?? true,
  });
}
