import { useQuery } from '@tanstack/react-query';
import { purchaseOrdersApi } from '../api/purchase-orders.api';
import { purchaseOrderKeys } from '../api/purchase-orders.keys';
import type { PurchaseOrderFilters } from '../types/purchase-order.types';

export function usePurchaseOrders(filters: PurchaseOrderFilters = {}) {
  return useQuery({
    queryKey: purchaseOrderKeys.list(filters),
    queryFn: () => purchaseOrdersApi.getOrders(filters),
    staleTime: 30_000,
  });
}
