import { useMutation } from '@tanstack/react-query';
import { wompiApi } from '../api/wompi.api';
import type { CreateWompiIntentPayload } from '../types/wompi.types';

export function useCreateWompiQrCheckout(orderId: string) {
  return useMutation({
    mutationFn: (payload: CreateWompiIntentPayload = {}) => wompiApi.createQrCheckout(orderId, payload),
  });
}
