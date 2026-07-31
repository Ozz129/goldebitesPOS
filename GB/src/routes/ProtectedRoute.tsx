import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePermissions } from '../modules/auth/hooks/use-permissions';

interface ProtectedRouteProps {
  /** Permiso(s) requeridos del catálogo real del backend. Un array significa "cualquiera de estos". */
  permission: string | string[];
}

export default function ProtectedRoute({ permission }: ProtectedRouteProps) {
  const { hasPermission, hasAnyPermission } = usePermissions();
  const location = useLocation();

  const allowed = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission);

  if (!allowed) {
    return <Navigate to="/sin-acceso" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
