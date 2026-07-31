import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cashSessionsApi } from '../api/cash-sessions.api';
import { cashSessionKeys } from '../api/cash-sessions.keys';
import type { CreateCashMovementPayload } from '../types/cash-session.types';

export function useAddCashMovement(branchId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateCashMovementPayload }) =>
      cashSessionsApi.addMovement(id, payload),
    onSuccess: () => {
      if (branchId) {
        queryClient.invalidateQueries({ queryKey: cashSessionKeys.current(branchId) });
      }
    },
  });
}
