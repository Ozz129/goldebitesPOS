import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Stack sx={{ alignItems: "center" }}>
        <EmptyState
          icon={ShieldAlert}
          title="No tienes acceso a este módulo"
          description="Tu rol actual no cuenta con permisos para ver esta sección. Cambia de rol desde tu perfil o vuelve al centro de operaciones."
        />
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: -2 }}>
          Ir al centro de operaciones
        </Button>
      </Stack>
    </Box>
  );
}
