import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Calculator } from 'lucide-react';
import CurrencyField from '../../../components/common/CurrencyField';
import { formatCOP } from '../../../utils/format';

interface CashChangeCalculatorProps {
  /** What's being charged — the "Monto" field if filled, otherwise the order's balance due. */
  amountDue: number;
}

/** "Paga con $X, el costo es $Y, el cambio es $Z" — a cash-register change helper, not submitted anywhere. */
export default function CashChangeCalculator({ amountDue }: CashChangeCalculatorProps) {
  const [received, setReceived] = useState<number | ''>('');
  const change = received === '' ? null : Math.round((Number(received) - amountDue) * 100) / 100;

  return (
    <Box sx={{ p: 1.5, mt: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 1 }}>
        <Calculator size={14} />
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          Calculadora de cambio
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Costo
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {formatCOP(amountDue)}
          </Typography>
        </Box>
        <CurrencyField size="small" label="Paga con" value={received} onChange={setReceived} sx={{ width: 140 }} />
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Cambio
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700 }}
            color={change === null ? 'text.primary' : change < 0 ? 'error.main' : 'success.main'}
          >
            {change === null ? '—' : `${formatCOP(Math.abs(change))}${change < 0 ? ' (falta)' : ''}`}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
