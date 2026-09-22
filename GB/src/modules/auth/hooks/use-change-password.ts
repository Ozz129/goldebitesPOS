import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { tokenStorage } from '../../../lib/api/token-storage';
import type { ChangePasswordPayload } from '../types/auth.types';

/**
 * The backend revokes every refresh token for this user on a successful
 * change (see AuthService.changePassword) — the access token already in
 * memory also still carries the stale mustChangePassword claim baked into
 * its JWT payload until it's reissued. Rather than patch around a token
 * that's about to stop working anyway, clear the session outright and send
 * the user back through /login with their new password.
 */
export function useChangePassword() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authApi.changePassword(payload),
    onSuccess: () => {
      tokenStorage.clearRefreshToken();
      clearSession();
      queryClient.clear();
    },
  });
}
