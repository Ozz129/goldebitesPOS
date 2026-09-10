import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wompiApi } from '../api/wompi.api';
import { orderKeys } from '../../orders/api/orders.keys';
import type { ConfirmWompiTransactionPayload } from '../types/wompi.types';

export function useConfirmWompiTransaction(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reference, payload }: { reference: string; payload: ConfirmWompiTransactionPayload }) =>
      wompiApi.confirmTransaction(orderId, reference, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.payments(orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
