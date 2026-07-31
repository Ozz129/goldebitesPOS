/**
 * Isolated storage for the refresh token.
 *
 * GB-BE currently returns the refresh token in the JSON body of
 * `/auth/login` and `/auth/refresh` instead of setting it as an httpOnly
 * cookie. Until the backend migrates to httpOnly cookies, we keep it here
 * (localStorage) so the rest of the app never touches raw storage directly
 * and the migration is a one-file change.
 *
 * The access token is NOT stored here — it lives in the auth Zustand store
 * (in memory, persisted for continuity across reloads).
 */
const REFRESH_TOKEN_KEY = 'gb-refresh-token';

export const tokenStorage = {
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  clearRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
