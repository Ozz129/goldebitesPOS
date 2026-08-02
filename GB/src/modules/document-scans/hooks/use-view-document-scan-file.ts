import { useMutation } from '@tanstack/react-query';
import { documentScansApi } from '../api/document-scans.api';

/**
 * The file endpoint requires the Authorization header, so a plain `<a href>`
 * can't open it directly — fetch it as a blob (auth header goes through the
 * normal apiClient interceptor) and open it via an Object URL instead.
 */
export function useViewDocumentScanFile() {
  return useMutation({
    mutationFn: async (id: string) => {
      const blob = await documentScansApi.getFileBlob(id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    },
  });
}
