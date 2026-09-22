import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export const FORCE_PASSWORD_CHANGE_PATH = '/cambiar-contrasena';

/** Gates the whole app on session state. Module/permission-level gating happens separately. */
export default function ProtectedRoute() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const mustChangePassword = useAuthStore((s) => s.user?.mustChangePassword);
  const location = useLocation();

  if (!isHydrated) {
    return (
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (mustChangePassword && location.pathname !== FORCE_PASSWORD_CHANGE_PATH) {
    return <Navigate to={FORCE_PASSWORD_CHANGE_PATH} replace />;
  }

  return <Outlet />;
}
