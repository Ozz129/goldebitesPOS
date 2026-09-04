import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sidesApi } from '../api/sides.api';
import { sideKeys } from '../api/sides.keys';
import type { UpdateSidePayload } from '../types/side.types';

export function useUpdateSide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSidePayload }) =>
      sidesApi.updateSide(id, payload),
    onSuccess: (side) => {
      queryClient.invalidateQueries({ queryKey: sideKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sideKeys.detail(side.id) });
    },
  });
}
