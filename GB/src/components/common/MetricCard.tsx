import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { brand } from '../../theme/palette';

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  to?: string;
  accent?: string;
  tone?: 'default' | 'warning' | 'error';
}

const TONE_COLOR: Record<NonNullable<MetricCardProps['tone']>, string> = {
  default: brand.gold,
  warning: '#D9A441',
  error: '#D9534F',
};

export default function MetricCard({
  label,
  value,
  icon: Icon,
  description,
  to,
  accent,
  tone = 'default',
}: MetricCardProps) {
  const navigate = useNavigate();
  const color = accent ?? TONE_COLOR[tone];

  const content = (
    <CardContent sx={{ height: '100%' }}>
      <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha(color, 0.14),
            color,
          }}
        >
          <Icon size={20} strokeWidth={2} />
        </Box>
        {to && (
          <Box sx={{ color: 'text.secondary', display: 'flex' }}>
            <ArrowUpRight size={18} />
          </Box>
        )}
      </Stack>
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 2 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {label}
      </Typography>
      {description && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {description}
        </Typography>
      )}
    </CardContent>
  );

  if (!to) return <Card sx={{ height: '100%' }}>{content}</Card>;

  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea onClick={() => navigate(to)} sx={{ height: '100%' }}>
        {content}
      </CardActionArea>
    </Card>
  );
}
