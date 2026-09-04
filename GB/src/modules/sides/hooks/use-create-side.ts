import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sidesApi } from '../api/sides.api';
import { sideKeys } from '../api/sides.keys';
import type { CreateSidePayload } from '../types/side.types';

export function useCreateSide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSidePayload) => sidesApi.createSide(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sideKeys.lists() });
    },
  });
}
