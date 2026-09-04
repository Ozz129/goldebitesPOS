import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saucesApi } from '../api/sauces.api';
import { sauceKeys } from '../api/sauces.keys';
import type { CreateSaucePayload } from '../types/sauce.types';

export function useCreateSauce() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSaucePayload) => saucesApi.createSauce(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sauceKeys.lists() });
    },
  });
}
