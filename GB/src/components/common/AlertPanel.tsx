import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { AlertTriangle, AlertCircle, Info, type LucideIcon } from 'lucide-react';
import { statusColors } from '../../theme/palette';
import EmptyState from './EmptyState';
import { CheckCircle2 } from 'lucide-react';

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  level: 'warning' | 'error' | 'info';
}

const LEVEL_ICON: Record<AlertItem['level'], LucideIcon> = {
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

const LEVEL_COLOR: Record<AlertItem['level'], string> = {
  warning: statusColors.warning,
  error: statusColors.error,
  info: statusColors.info,
};

export default function AlertPanel({
  title = 'Alertas operativas',
  alerts,
  onAlertClick,
}: {
  title?: string;
  alerts: AlertItem[];
  onAlertClick?: (alert: AlertItem) => void;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
          {title}
        </Typography>
        {alerts.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Todo en orden"
            description="No hay alertas operativas activas en este momento."
          />
        ) : (
          <Stack spacing={1.25}>
            {alerts.map((alert) => {
              const Icon = LEVEL_ICON[alert.level];
              const color = LEVEL_COLOR[alert.level];
              return (
                <Box
                  key={alert.id}
                  onClick={onAlertClick ? () => onAlertClick(alert) : undefined}
                  sx={{
                    display: 'flex',
                    gap: 1.25,
                    p: 1.25,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: alpha(color, 0.35),
                    backgroundColor: alpha(color, 0.08),
                    cursor: onAlertClick ? 'pointer' : 'default',
                    transition: 'background-color 0.15s ease',
                    '&:hover': onAlertClick ? { backgroundColor: alpha(color, 0.14) } : undefined,
                  }}
                >
                  <Box sx={{ color, flexShrink: 0, mt: 0.25 }}>
                    <Icon size={16} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {alert.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {alert.message}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
