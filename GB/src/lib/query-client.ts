import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { isNativeApp } from './native/platform';

// 429: reintentar de inmediato una petición rechazada por exceso solo empeora el exceso.
const NON_RETRYABLE_STATUSES = new Set([400, 401, 403, 404, 429]);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      // The installed phone apps keep checking out of view (a table calling,
      // a new delivery) to notify; a browser tab stops until it is back.
      refetchIntervalInBackground: isNativeApp,
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
