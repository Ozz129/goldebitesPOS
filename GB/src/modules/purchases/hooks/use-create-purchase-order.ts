import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrdersApi } from '../api/purchase-orders.api';
import { purchaseOrderKeys } from '../api/purchase-orders.keys';
import type { CreatePurchaseOrderPayload } from '../types/purchase-order.types';

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePurchaseOrderPayload) => purchaseOrdersApi.createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
    },
  });
}
