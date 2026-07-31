import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { orderKeys } from '../api/orders.keys';
import type { CreatePaymentPayload } from '../types/payment.types';

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: CreatePaymentPayload }) =>
      ordersApi.createPayment(orderId, payload),
    onSuccess: (_payment, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.payments(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
