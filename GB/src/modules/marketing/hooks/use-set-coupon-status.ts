import { useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsApi } from '../api/marketing.api';
import { couponKeys } from '../api/marketing.keys';

export function useSetCouponStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      couponsApi.setCouponStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
    },
  });
}
