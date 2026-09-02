import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { orderKeys } from '../api/orders.keys';

/** Orders left open from previous business days — powers the "pedidos atrasados" warning/board. */
export function useOrdersBacklog(branchId?: string) {
  return useQuery({
    queryKey: orderKeys.backlog(branchId),
    queryFn: () => ordersApi.getBacklog(branchId),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
