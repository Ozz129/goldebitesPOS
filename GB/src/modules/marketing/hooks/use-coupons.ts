import { useQuery } from '@tanstack/react-query';
import { couponsApi } from '../api/marketing.api';
import { couponKeys } from '../api/marketing.keys';
import type { CouponFilters } from '../types/marketing.types';

export function useCoupons(filters: CouponFilters = {}) {
  return useQuery({
    queryKey: couponKeys.list(filters),
    queryFn: () => couponsApi.getCoupons(filters),
    staleTime: 30_000,
  });
}
