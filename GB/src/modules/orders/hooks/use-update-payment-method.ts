import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { orderKeys } from '../api/orders.keys';
import type { UpdatePaymentMethodPayload } from '../types/payment.types';

export function useUpdatePaymentMethod(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, payload }: { paymentId: string; payload: UpdatePaymentMethodPayload }) =>
      ordersApi.updatePaymentMethod(orderId, paymentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.payments(orderId) });
    },
  });
}
