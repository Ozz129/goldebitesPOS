import { useMutation } from '@tanstack/react-query';
import { wompiApi } from '../api/wompi.api';
import type { CreateWompiIntentPayload } from '../types/wompi.types';

export function useCreateWompiIntent(orderId: string) {
  return useMutation({
    mutationFn: (payload: CreateWompiIntentPayload = {}) => wompiApi.createIntent(orderId, payload),
  });
}
