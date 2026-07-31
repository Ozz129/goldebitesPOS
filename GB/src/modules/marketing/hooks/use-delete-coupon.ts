import { useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsApi } from '../api/marketing.api';
import { couponKeys } from '../api/marketing.keys';

/** Backend performs a soft delete (DELETE /marketing-coupons/:id). */
export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => couponsApi.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
    },
  });
}
