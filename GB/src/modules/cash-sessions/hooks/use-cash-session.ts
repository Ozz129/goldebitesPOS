import { useQuery } from '@tanstack/react-query';
import { cashSessionsApi } from '../api/cash-sessions.api';
import { cashSessionKeys } from '../api/cash-sessions.keys';

/** A single session by id, with its movements — used to view a session under RECTIFYING correction. */
export function useCashSession(id: string | null) {
  return useQuery({
    queryKey: cashSessionKeys.detail(id ?? ''),
    queryFn: () => cashSessionsApi.getSession(id as string),
    enabled: Boolean(id),
  });
}
