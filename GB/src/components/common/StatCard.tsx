import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { brand } from '../../theme/palette';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: number;
  helperText?: string;
  accent?: string;
}

export default function StatCard({ label, value, icon: Icon, trend, helperText, accent }: StatCardProps) {
  const color = accent ?? brand.gold;
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
          <Stack spacing={0.5}>
            <Typography variant="overline" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
          </Stack>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(color, 0.14),
              color,
              flexShrink: 0,
            }}
          >
            <Icon size={20} strokeWidth={2} />
          </Box>
        </Stack>
        {(trend !== undefined || helperText) && (
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mt: 1.5 }}>
            {trend !== undefined && (
              <Stack
                direction="row"
                spacing={0.25}
               
                sx={{ alignItems: "center", color: trend >= 0 ? 'success.main' : 'error.main' }}
              >
                {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {Math.abs(trend).toFixed(1)}%
                </Typography>
              </Stack>
            )}
            {helperText && (
              <Typography variant="caption" color="text.secondary">
                {helperText}
              </Typography>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
