import { useState } from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import ButtonBase from '@mui/material/ButtonBase';
import { ChevronDown, Moon, Sun, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuthStore } from '../../modules/auth/store/auth.store';
import { useLogout } from '../../modules/auth/hooks/use-logout';
import { useUiStore } from '../../store/uiStore';
import { initialsFromName } from '../../utils/format';
import { brand } from '../../theme/palette';

/** Etiquetas en español solo para los roles de sistema sembrados por negocio; un rol personalizado se muestra tal cual (`role.name` real). */
const SYSTEM_ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super administrador',
  OWNER: 'Propietario',
  MANAGER: 'Gerente',
  CASHIER: 'Cajero',
  KITCHEN: 'Cocina',
  INVENTORY: 'Inventario',
  EMPLOYEE: 'Empleado',
};

export default function UserMenu() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const user = useAuthStore((s) => s.user);
  const themeMode = useUiStore((s) => s.themeMode);
  const toggleThemeMode = useUiStore((s) => s.toggleThemeMode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const logout = useLogout();

  const close = () => setAnchorEl(null);

  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const roleLabel = SYSTEM_ROLE_LABELS[user.roleName] ?? user.roleName;

  const handleLogout = () => {
    close();
    logout.mutate(undefined, {
      onSuccess: () => enqueueSnackbar('Sesión cerrada', { variant: 'success' }),
      onSettled: () => navigate('/login', { replace: true }),
    });
  };

  return (
    <>
      <ButtonBase
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ borderRadius: 2, p: 0.5, gap: 1, display: 'flex', alignItems: 'center' }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: brand.gold,
            color: brand.black,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {initialsFromName(fullName)}
        </Avatar>
        <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {roleLabel}
          </Typography>
        </Box>
        <ChevronDown size={14} />
      </ButtonBase>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 300 } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
        <Divider />

        <MenuItem onClick={toggleThemeMode}>
          <ListItemIcon>
            {themeMode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </ListItemIcon>
          <ListItemText primary={themeMode === 'dark' ? 'Modo claro' : 'Modo oscuro'} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            close();
            navigate('/configuracion');
          }}
        >
          <ListItemIcon>
            <SettingsIcon size={17} />
          </ListItemIcon>
          <ListItemText primary="Configuración" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogOut size={17} />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </MenuItem>
      </Menu>
    </>
  );
}
