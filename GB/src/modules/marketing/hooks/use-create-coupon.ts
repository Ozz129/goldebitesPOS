import { useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsApi } from '../api/marketing.api';
import { couponKeys } from '../api/marketing.keys';
import type { CreateCouponPayload } from '../types/marketing.types';

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCouponPayload) => couponsApi.createCoupon(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
    },
  });
}
