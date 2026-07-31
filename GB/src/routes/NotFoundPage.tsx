import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Stack sx={{ alignItems: "center" }}>
        <EmptyState
          icon={Compass}
          title="Página no encontrada"
          description="La ruta que buscas no existe o fue movida."
        />
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: -2 }}>
          Volver al inicio
        </Button>
      </Stack>
    </Box>
  );
}
