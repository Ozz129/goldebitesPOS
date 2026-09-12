import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bankTransferApi } from '../api/bank-transfer.api';
import { bankTransferKeys } from './bank-transfer.keys';
import { orderKeys } from '../../orders/api/orders.keys';

export function useConfirmBankTransferManual(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) => bankTransferApi.confirmManual(orderId, transactionId),
    onSuccess: (status) => {
      queryClient.setQueryData(bankTransferKeys.status(orderId), status);
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.payments(orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
