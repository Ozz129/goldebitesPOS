import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const NON_RETRYABLE_STATUSES = new Set([400, 401, 403, 404]);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = error instanceof AxiosError ? error.response?.status : undefined;
        if (status && NON_RETRYABLE_STATUSES.has(status)) {
          return false;
        }
        return failureCount < 1;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
