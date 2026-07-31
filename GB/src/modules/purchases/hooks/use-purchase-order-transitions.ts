import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrdersApi } from '../api/purchase-orders.api';
import { purchaseOrderKeys } from '../api/purchase-orders.keys';

function useTransition(action: (id: string) => ReturnType<typeof purchaseOrdersApi.submit>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => action(id),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(order.id) });
    },
  });
}

export function useSubmitPurchaseOrder() {
  return useTransition(purchaseOrdersApi.submit);
}

export function useApprovePurchaseOrder() {
  return useTransition(purchaseOrdersApi.approve);
}

export function useCancelPurchaseOrder() {
  return useTransition(purchaseOrdersApi.cancel);
}
