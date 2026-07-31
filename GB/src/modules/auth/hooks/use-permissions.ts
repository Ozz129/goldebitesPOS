import { useMemo } from 'react';
import { useAuthStore } from '../store/auth.store';
import { decodeAccessToken } from '../utils/decode-access-token';

/**
 * Real, backend-driven permission checks (codes from the JWT, e.g.
 * "products.read"). Distinct from the legacy src/hooks/usePermissions.ts,
 * which gates sidebar navigation by a coarse role→module mapping — see
 * INTEGRATION_STATUS.md for why the two haven't been reconciled yet.
 */
export function usePermissions() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const permissions = useMemo(() => {
    if (!accessToken) return [];
    return decodeAccessToken(accessToken)?.permissions ?? [];
  }, [accessToken]);

  return {
    permissions,
    hasPermission: (permission: string) => permissions.includes(permission),
    hasAnyPermission: (perms: string[]) => perms.some((p) => permissions.includes(p)),
    hasAllPermissions: (perms: string[]) => perms.every((p) => permissions.includes(p)),
  };
}
