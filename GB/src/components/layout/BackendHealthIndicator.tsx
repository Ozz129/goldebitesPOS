import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import { useBackendHealth } from '../../lib/health/use-backend-health';
import { statusColors } from '../../theme/palette';

/** Dev-only discreet dot: green when the backend + DB answer, red otherwise. */
export default function BackendHealthIndicator() {
  const { data, isError } = useBackendHealth();

  if (!import.meta.env.DEV) return null;

  const isHealthy = data?.status === 'ok' && !isError;

  return (
    <Tooltip
      title={
        isHealthy
          ? 'Backend conectado'
          : 'Backend no disponible — verifica que GB-BE esté corriendo en localhost:3000'
      }
    >
      <Box
        sx={{
          width: 9,
          height: 9,
          borderRadius: '50%',
          bgcolor: isHealthy ? statusColors.success : statusColors.error,
          mx: 1,
        }}
      />
    </Tooltip>
  );
}
