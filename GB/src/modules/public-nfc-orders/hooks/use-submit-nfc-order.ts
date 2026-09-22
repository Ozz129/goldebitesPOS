import { useMutation } from '@tanstack/react-query';
import { publicNfcOrdersApi } from '../api/public-nfc-orders.api';
import type { SubmitNfcOrderPayload } from '../types/public-nfc-order.types';

/** No retry config needed: a retry with the same idempotencyKey is safe by design (replays, never duplicates). */
export function useSubmitNfcOrder(token: string | undefined) {
  return useMutation({
    mutationFn: (payload: SubmitNfcOrderPayload) => publicNfcOrdersApi.submit(token as string, payload),
  });
}
