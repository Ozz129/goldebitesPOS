import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { cashSessionsApi } from '../api/cash-sessions.api';
import { cashSessionKeys } from '../api/cash-sessions.keys';

/** A 404 here means "no open session for this branch", not a real error. */
export function useCurrentCashSession(branchId: string | null) {
  const query = useQuery({
    queryKey: cashSessionKeys.current(branchId ?? ''),
    queryFn: () => cashSessionsApi.getCurrent(branchId as string),
    enabled: Boolean(branchId),
    retry: false,
  });

  const isNotFound = query.error instanceof AxiosError && query.error.response?.status === 404;

  return { ...query, isError: query.isError && !isNotFound, hasNoOpenSession: isNotFound };
}
