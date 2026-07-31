import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { tokenStorage } from '../../../lib/api/token-storage';
import type { LoginPayload } from '../types/auth.types';

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      tokenStorage.setRefreshToken(data.refreshToken);
      setSession({ user: data.user, accessToken: data.accessToken });
    },
  });
}
