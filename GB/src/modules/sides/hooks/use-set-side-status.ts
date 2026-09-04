import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sidesApi } from '../api/sides.api';
import { sideKeys } from '../api/sides.keys';

export function useSetSideStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      sidesApi.setSideStatus(id, isActive),
    onSuccess: (side) => {
      queryClient.invalidateQueries({ queryKey: sideKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sideKeys.detail(side.id) });
    },
  });
}
