import { useMutation, useQueryClient } from '@tanstack/react-query';
import { businessesApi } from '../api/businesses.api';
import type { UpdateBusinessPayload } from '../types/business.types';

export function useUpdateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateBusinessPayload) => businessesApi.updateMine(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses', 'me'] });
    },
  });
}
