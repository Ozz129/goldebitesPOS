import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saucesApi } from '../api/sauces.api';
import { sauceKeys } from '../api/sauces.keys';

export function useSetSauceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      saucesApi.setSauceStatus(id, isActive),
    onSuccess: (sauce) => {
      queryClient.invalidateQueries({ queryKey: sauceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sauceKeys.detail(sauce.id) });
    },
  });
}
