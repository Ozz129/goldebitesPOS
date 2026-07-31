import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsStore, type NotificationLevel } from '../../store/notificationsStore';
import EmptyState from '../common/EmptyState';
import { statusColors } from '../../theme/palette';

const LEVEL_ICON: Record<NotificationLevel, typeof Bell> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

const LEVEL_COLOR: Record<NotificationLevel, string> = {
  info: statusColors.info,
  success: statusColors.success,
  warning: statusColors.warning,
  error: statusColors.error,
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.round(hours / 24)} d`;
}

export default function NotificationsMenu() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const notifications = useNotificationsStore((s) => s.notifications);
  const markAsRead = useNotificationsStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      <Tooltip title="Notificaciones">
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: 'text.secondary' }}>
          <Badge badgeContent={unread} color="error">
            <Bell size={19} />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 380, maxHeight: 480 } } }}
      >
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Notificaciones
          </Typography>
          {unread > 0 && (
            <Button size="small" onClick={markAllAsRead}>
              Marcar todas como leídas
            </Button>
          )}
        </Stack>
        <Divider />
        {notifications.length === 0 ? (
          <EmptyState title="Sin notificaciones" description="Estás al día con la operación." />
        ) : (
          <Box sx={{ overflowY: 'auto', maxHeight: 400 }}>
            {notifications.map((n) => {
              const Icon = LEVEL_ICON[n.level];
              const color = LEVEL_COLOR[n.level];
              return (
                <Box
                  key={n.id}
                  onClick={() => {
                    markAsRead(n.id);
                    setAnchorEl(null);
                    if (n.link) navigate(n.link);
                  }}
                  sx={{
                    display: 'flex',
                    gap: 1.25,
                    p: 1.75,
                    cursor: 'pointer',
                    backgroundColor: n.read ? 'transparent' : alpha(color, 0.06),
                    '&:hover': { backgroundColor: alpha(color, 0.1) },
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ color, mt: 0.25, flexShrink: 0 }}>
                    <Icon size={16} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: n.read ? 500 : 700 }}>
                      {n.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {n.message}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {relativeTime(n.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Popover>
    </>
  );
}
