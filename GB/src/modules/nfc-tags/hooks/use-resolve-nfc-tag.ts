import { useQuery } from '@tanstack/react-query';
import { publicNfcApi } from '../api/nfc-tags.api';

/** Public, unauthenticated — the backend returns the same generic 404 whether the token never existed, or the gallo/branch/business is inactive. */
export function useResolveNfcTag(token: string | undefined) {
  return useQuery({
    queryKey: ['public-nfc', token],
    queryFn: () => publicNfcApi.resolve(token as string),
    enabled: Boolean(token),
    retry: false,
  });
}
