import { useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsApi } from '../api/marketing.api';
import { couponKeys } from '../api/marketing.keys';
import type { UpdateCouponPayload } from '../types/marketing.types';

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCouponPayload }) =>
      couponsApi.updateCoupon(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
    },
  });
}
