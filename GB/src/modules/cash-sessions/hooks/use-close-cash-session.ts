import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cashSessionsApi } from '../api/cash-sessions.api';
import { cashSessionKeys } from '../api/cash-sessions.keys';
import type { CloseCashSessionPayload } from '../types/cash-session.types';

export function useCloseCashSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CloseCashSessionPayload }) =>
      cashSessionsApi.close(id, payload),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: cashSessionKeys.current(session.branchId) });
      queryClient.invalidateQueries({ queryKey: cashSessionKeys.lists() });
    },
  });
}
