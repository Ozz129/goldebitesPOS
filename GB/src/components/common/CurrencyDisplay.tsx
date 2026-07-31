import Typography, { type TypographyProps } from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCOP } from '../../utils/format';

interface CurrencyDisplayProps extends Omit<TypographyProps, 'children'> {
  value: number;
  trend?: number;
  showSign?: boolean;
}

export default function CurrencyDisplay({
  value,
  trend,
  showSign,
  ...typographyProps
}: CurrencyDisplayProps) {
  const sign = showSign && value > 0 ? '+' : '';
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      <Typography {...typographyProps}>
        {sign}
        {formatCOP(value)}
      </Typography>
      {trend !== undefined && (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.25,
            color: trend >= 0 ? 'success.main' : 'error.main',
          }}
        >
          {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {Math.abs(trend).toFixed(1)}%
          </Typography>
        </Box>
      )}
    </Box>
  );
}
