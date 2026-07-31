import { useQuery } from '@tanstack/react-query';
import { purchaseOrdersApi } from '../api/purchase-orders.api';
import { purchaseOrderKeys } from '../api/purchase-orders.keys';

export function usePurchaseOrder(id: string | null) {
  return useQuery({
    queryKey: purchaseOrderKeys.detail(id ?? ''),
    queryFn: () => purchaseOrdersApi.getOrder(id as string),
    enabled: Boolean(id),
  });
}
