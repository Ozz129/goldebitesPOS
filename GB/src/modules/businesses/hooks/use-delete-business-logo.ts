import { useMutation, useQueryClient } from '@tanstack/react-query';
import { businessesApi } from '../api/businesses.api';

export function useDeleteBusinessLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => businessesApi.deleteLogo(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses', 'me'] });
    },
  });
}
