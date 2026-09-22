import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { MapPin, Store } from 'lucide-react';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton';
import ErrorState from '../../../components/common/ErrorState';
import { useResolveNfcTag } from '../../../modules/nfc-tags/hooks/use-resolve-nfc-tag';
import type { OrderType } from '../../../modules/orders/types/order.types';
import PublicMenuBrowser from '../components/PublicMenuBrowser';

const DINE_TAKEAWAY_TYPES: Extract<OrderType, 'DINE_IN' | 'TAKEAWAY'>[] = ['DINE_IN', 'TAKEAWAY'];
const TYPE_LABELS: Record<'DINE_IN' | 'TAKEAWAY', string> = { DINE_IN: 'Comer aquí', TAKEAWAY: 'Para llevar' };

/**
 * Scanned from a gallo NFC point — resolves the token to a fixed
 * business/branch/table context the customer never edits directly (BR: "el
 * cliente no podrá cambiar manualmente la mesa asociada"). "Para llevar"
 * still preserves that NFC origin internally, it just changes how the table
 * is presented (delivery at the counter instead of the table).
 */
export default function NfcTableMenuPage() {
  const { token } = useParams<{ token: string }>();
  const { data: resolved, isLoading, isError } = useResolveNfcTag(token);
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 3, sm: 6 }, px: 2 }}>
      <Box sx={{ maxWidth: 640, mx: 'auto' }}>
        {isLoading && <LoadingSkeleton variant="page" />}

        {isError && (
          <ErrorState
            title="Enlace no disponible"
            description="Este enlace ya no está activo. Pide ayuda al personal para escanear de nuevo."
          />
        )}

        {resolved && (
          <Stack sx={{ alignItems: 'center', textAlign: 'center', mb: 3 }} spacing={1.5}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {resolved.businessName}
            </Typography>

            <ToggleButtonGroup
              exclusive
              size="small"
              value={orderType}
              onChange={(_, next: 'DINE_IN' | 'TAKEAWAY' | null) => next && setOrderType(next)}
            >
              {DINE_TAKEAWAY_TYPES.map((type) => (
                <ToggleButton key={type} value={type} sx={{ fontWeight: 700, px: 2.5 }}>
                  {TYPE_LABELS[type]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {orderType === 'DINE_IN' ? (
              <Chip
                icon={<MapPin size={16} />}
                label={`Mesa ${resolved.tableNumber}`}
                color="primary"
                sx={{ fontWeight: 700 }}
              />
            ) : (
              <Chip icon={<Store size={16} />} label="Entrega en mostrador" sx={{ fontWeight: 700 }} />
            )}
          </Stack>
        )}
      </Box>

      {resolved && (
        <PublicMenuBrowser
          businessId={resolved.businessId}
          showMenuLabel={false}
          token={token}
          orderType={orderType}
        />
      )}
    </Box>
  );
}
