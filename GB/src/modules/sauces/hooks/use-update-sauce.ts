import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saucesApi } from '../api/sauces.api';
import { sauceKeys } from '../api/sauces.keys';
import type { UpdateSaucePayload } from '../types/sauce.types';

export function useUpdateSauce() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSaucePayload }) =>
      saucesApi.updateSauce(id, payload),
    onSuccess: (sauce) => {
      queryClient.invalidateQueries({ queryKey: sauceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sauceKeys.detail(sauce.id) });
    },
  });
}
