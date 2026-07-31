import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Timer } from 'lucide-react';
import { formatStopwatch } from '../../../utils/format';
import { getElapsedMinutes, ORDER_SLA_MINUTES } from '../utils';

export default function OrderTimer({ createdAt, compact }: { createdAt: string; compact?: boolean }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const elapsedMs = now - new Date(createdAt).getTime();
  const delayed = getElapsedMinutes(createdAt) > ORDER_SLA_MINUTES;

  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{ alignItems: 'center', color: delayed ? 'error.main' : 'text.secondary' }}
    >
      <Timer size={compact ? 12 : 14} />
      <Typography variant={compact ? 'caption' : 'body2'} sx={{ fontWeight: delayed ? 700 : 500 }}>
        {formatStopwatch(elapsedMs)}
      </Typography>
    </Stack>
  );
}
