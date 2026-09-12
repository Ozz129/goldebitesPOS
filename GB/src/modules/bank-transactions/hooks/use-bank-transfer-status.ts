import { useQuery } from '@tanstack/react-query';
import { bankTransferApi } from '../api/bank-transfer.api';
import { bankTransferKeys } from './bank-transfer.keys';

const POLL_INTERVAL_MS = 5000;

/** Polls only while a request is WAITING — stops itself once MATCHED/NONE, same pattern as the rest of the app. */
export function useBankTransferStatus(orderId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: bankTransferKeys.status(orderId ?? ''),
    queryFn: () => bankTransferApi.getStatus(orderId as string),
    enabled: Boolean(orderId) && enabled,
    refetchInterval: (query) => (query.state.data?.state === 'WAITING' ? POLL_INTERVAL_MS : false),
  });
}
