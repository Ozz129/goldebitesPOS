import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bankTransferApi } from '../api/bank-transfer.api';
import { bankTransferKeys } from './bank-transfer.keys';

export function useCancelBankTransfer(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => bankTransferApi.cancel(orderId),
    onSuccess: (status) => {
      queryClient.setQueryData(bankTransferKeys.status(orderId), status);
    },
  });
}
