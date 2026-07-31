import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { X } from 'lucide-react';

interface FormDrawerProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  loading?: boolean;
  submitDisabled?: boolean;
  width?: number;
  children: React.ReactNode;
}

export default function FormDrawer({
  open,
  title,
  subtitle,
  onClose,
  onSubmit,
  submitLabel = 'Guardar',
  loading,
  submitDisabled,
  width = 480,
  children,
}: FormDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: width } } } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", p: 2.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </IconButton>
        </Stack>
        <Divider />
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>{children}</Box>
        {onSubmit && (
          <>
            <Divider />
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end", p: 2.5 }}>
              <Button color="inherit" onClick={onClose}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={onSubmit} loading={loading} disabled={submitDisabled}>
                {submitLabel}
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </Drawer>
  );
}
