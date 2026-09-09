import { useMutation, useQueryClient } from '@tanstack/react-query';
import { businessesApi } from '../api/businesses.api';

export function useUploadBusinessLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => businessesApi.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses', 'me'] });
    },
  });
}
