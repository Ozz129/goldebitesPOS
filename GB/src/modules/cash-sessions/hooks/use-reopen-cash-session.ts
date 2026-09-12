import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cashSessionsApi } from '../api/cash-sessions.api';
import { cashSessionKeys } from '../api/cash-sessions.keys';
import type { ReopenCashSessionPayload } from '../types/cash-session.types';

export function useReopenCashSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReopenCashSessionPayload }) =>
      cashSessionsApi.reopen(id, payload),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: cashSessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cashSessionKeys.detail(session.id) });
    },
  });
}
