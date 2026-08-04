import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePermissions } from '../modules/auth/hooks/use-permissions';

/** Gates a route to platform operators (users.is_platform_admin), independent of the normal business permission catalog. */
export default function PlatformAdminRoute() {
  const { isPlatformAdmin } = usePermissions();
  const location = useLocation();

  if (!isPlatformAdmin) {
    return <Navigate to="/sin-acceso" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
