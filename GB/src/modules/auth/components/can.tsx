import type { ReactNode } from 'react';
import { usePermissions } from '../hooks/use-permissions';

interface CanProps {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/** Renders `children` only if the current user holds the required permission(s). */
export function Can({ permission, anyOf, allOf, children, fallback = null }: CanProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const allowed = permission
    ? hasPermission(permission)
    : anyOf
      ? hasAnyPermission(anyOf)
      : allOf
        ? hasAllPermissions(allOf)
        : true;

  return allowed ? <>{children}</> : <>{fallback}</>;
}
