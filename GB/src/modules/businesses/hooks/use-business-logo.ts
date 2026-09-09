import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { businessesApi } from '../api/businesses.api';

function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Fetches the business logo as a base64 data URI (not a plain <img src> URL) because the
 * endpoint requires the same bearer-token auth as everything else, which a bare <img> tag
 * can't send — this matters both for the Settings preview and for embedding the logo into
 * printed documents (kitchen tickets, invoices, payment receipts), which are self-contained
 * HTML strings with no ability to make an authenticated follow-up request.
 */
export function useBusinessLogo() {
  return useQuery({
    queryKey: ['businesses', 'me', 'logo'],
    queryFn: async () => {
      try {
        const blob = await businessesApi.getLogoBlob();
        return await blobToDataUri(blob);
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  });
}
