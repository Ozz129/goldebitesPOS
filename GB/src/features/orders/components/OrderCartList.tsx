import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCOP } from '../../../utils/format';
import { useSauces } from '../../../modules/sauces/hooks/use-sauces';
import { useSides } from '../../../modules/sides/hooks/use-sides';
import type { CartLine } from '../../kiosk-waiter/components/CartPanel';

interface OrderCartListProps {
  cart: CartLine[];
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  onToggleSauce: (productId: string, sauceId: string) => void;
  onToggleSide: (productId: string, sideId: string) => void;
  emptyMessage?: string;
}

/** Cart line list with quantity steppers and sauce/side chips — same behavior as the waiter kiosk's cart. */
export default function OrderCartList({
  cart,
  onIncrement,
  onDecrement,
  onRemove,
  onToggleSauce,
  onToggleSide,
  emptyMessage = 'Toca un producto para agregarlo.',
}: OrderCartListProps) {
  const { data: saucesData } = useSauces({ isActive: true, limit: 100 });
  const { data: sidesData } = useSides({ isActive: true, limit: 100 });
  const sauces = saucesData?.data ?? [];
  const sides = sidesData?.data ?? [];

  if (cart.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <Stack spacing={0}>
      {cart.map((line) => (
        <Box
          key={line.productId}
          sx={{
            px: 1.5,
            py: 1.25,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {line.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatCOP(line.unitPrice)} c/u
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => onDecrement(line.productId)}>
              <Minus size={16} />
            </IconButton>
            <Typography sx={{ minWidth: 20, textAlign: 'center', fontWeight: 700 }}>{line.quantity}</Typography>
            <IconButton size="small" onClick={() => onIncrement(line.productId)}>
              <Plus size={16} />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => onRemove(line.productId)}>
              <Trash2 size={16} />
            </IconButton>
          </Stack>

          {line.maxSauces > 0 && (
            <Box sx={{ mt: 0.75 }}>
              <Typography variant="caption" color="text.secondary">
                Salsas (máx. {line.maxSauces})
              </Typography>
              <Stack direction="row" spacing={0.75} useFlexGap sx={{ mt: 0.25, flexWrap: 'wrap' }}>
                {sauces.map((sauce) => {
                  const selected = line.sauceIds.includes(sauce.id);
                  const disabled = !selected && line.sauceIds.length >= line.maxSauces;
                  return (
                    <Chip
                      key={sauce.id}
                      label={sauce.name}
                      size="small"
                      clickable={!disabled}
                      disabled={disabled}
                      onClick={() => onToggleSauce(line.productId, sauce.id)}
                      color={selected ? 'primary' : 'default'}
                      variant={selected ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600 }}
                    />
                  );
                })}
              </Stack>
            </Box>
          )}

          {line.maxSides > 0 && (
            <Box sx={{ mt: 0.75 }}>
              <Typography variant="caption" color="text.secondary">
                Acompañantes (máx. {line.maxSides})
              </Typography>
              <Stack direction="row" spacing={0.75} useFlexGap sx={{ mt: 0.25, flexWrap: 'wrap' }}>
                {sides.map((side) => {
                  const selected = line.sideIds.includes(side.id);
                  const disabled = !selected && line.sideIds.length >= line.maxSides;
                  return (
                    <Chip
                      key={side.id}
                      label={side.name}
                      size="small"
                      clickable={!disabled}
                      disabled={disabled}
                      onClick={() => onToggleSide(line.productId, side.id)}
                      color={selected ? 'primary' : 'default'}
                      variant={selected ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600 }}
                    />
                  );
                })}
              </Stack>
            </Box>
          )}
        </Box>
      ))}
    </Stack>
  );
}
