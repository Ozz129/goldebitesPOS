import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthenticatedProfile } from '../types/auth.types';

interface AuthState {
  user: AuthenticatedProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  /** True once the persisted session has been read from storage on app start. */
  isHydrated: boolean;
  setSession: (session: { user: AuthenticatedProfile; accessToken: string }) => void;
  clearSession: () => void;
}

/**
 * Single source of truth for the authenticated session.
 *
 * The refresh token is intentionally NOT stored here — see
 * src/lib/api/token-storage.ts. Never add a password field to this store.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrated: false,
      setSession: ({ user, accessToken }) => set({ user, accessToken, isAuthenticated: true }),
      clearSession: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'gb-auth-session',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Attached after the store exists (not via onRehydrateStorage) so there's no
// risk of this firing before `useAuthStore` itself has finished initializing.
useAuthStore.persist.onFinishHydration(() => {
  useAuthStore.setState({ isHydrated: true });
});
if (useAuthStore.persist.hasHydrated()) {
  useAuthStore.setState({ isHydrated: true });
}
