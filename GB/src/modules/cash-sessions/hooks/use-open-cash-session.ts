import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cashSessionsApi } from '../api/cash-sessions.api';
import { cashSessionKeys } from '../api/cash-sessions.keys';
import type { OpenCashSessionPayload } from '../types/cash-session.types';

export function useOpenCashSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OpenCashSessionPayload) => cashSessionsApi.open(payload),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: cashSessionKeys.current(session.branchId) });
      queryClient.invalidateQueries({ queryKey: cashSessionKeys.lists() });
    },
  });
}
