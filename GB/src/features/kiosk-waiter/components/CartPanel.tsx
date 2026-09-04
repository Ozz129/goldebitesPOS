import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { Minus, Plus, Trash2, Send } from 'lucide-react';
import { formatCOP } from '../../../utils/format';
import { ORDER_TYPE_LABELS } from '../../../modules/orders/order-status';
import type { OrderType } from '../../../modules/orders/types/order.types';
import { useSauces } from '../../../modules/sauces/hooks/use-sauces';
import { useSides } from '../../../modules/sides/hooks/use-sides';
import TableNumberPicker from './TableNumberPicker';

export interface CartLine {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  maxSauces: number;
  maxSides: number;
  sauceIds: string[];
  sideIds: string[];
}

interface CartPanelProps {
  cart: CartLine[];
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  onToggleSauce: (productId: string, sauceId: string) => void;
  onToggleSide: (productId: string, sideId: string) => void;
  tableNumber: string;
  onTableNumberChange: (value: string) => void;
  orderType: OrderType;
  onOrderTypeChange: (value: OrderType) => void;
  orderNotes: string;
  onOrderNotesChange: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

const CART_ORDER_TYPES: OrderType[] = ['DINE_IN', 'TAKEAWAY'];

export default function CartPanel({
  cart,
  onIncrement,
  onDecrement,
  onRemove,
  onToggleSauce,
  onToggleSide,
  tableNumber,
  onTableNumberChange,
  orderType,
  onOrderTypeChange,
  orderNotes,
  onOrderNotesChange,
  onSubmit,
  submitting,
}: CartPanelProps) {
  const { data: saucesData } = useSauces({ isActive: true, limit: 100 });
  const { data: sidesData } = useSides({ isActive: true, limit: 100 });
  const sauces = saucesData?.data ?? [];
  const sides = sidesData?.data ?? [];

  const total = cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const canSubmit = cart.length > 0 && !submitting;

  return (
    <Stack sx={{ height: '100%' }}>
      <Box sx={{ p: 1.5 }}>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={orderType}
          onChange={(_, next: OrderType | null) => next && onOrderTypeChange(next)}
        >
          {CART_ORDER_TYPES.map((type) => (
            <ToggleButton key={type} value={type} sx={{ fontWeight: 700 }}>
              {ORDER_TYPE_LABELS[type]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {orderType === 'DINE_IN' && (
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <TableNumberPicker value={tableNumber} onChange={onTableNumberChange} />
        </Box>
      )}

      <Divider />

      <Stack spacing={0} sx={{ flex: 1, overflowY: 'auto' }}>
        {cart.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            Toca un producto para agregarlo al pedido.
          </Typography>
        ) : (
          cart.map((line) => (
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
                <Typography sx={{ minWidth: 20, textAlign: 'center', fontWeight: 700 }}>
                  {line.quantity}
                </Typography>
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
          ))
        )}
      </Stack>

      <Divider />

      <Box sx={{ px: 1.5, py: 1.25 }}>
        <TextField
          value={orderNotes}
          onChange={(e) => onOrderNotesChange(e.target.value)}
          label="Comentario del pedido (opcional)"
          placeholder="Ej. Sin cebolla, cliente frecuente..."
          multiline
          minRows={2}
          fullWidth
          size="small"
        />
      </Box>

      <Divider sx={{ borderBottomWidth: 2 }} />

      <Box sx={{ p: 2 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Total
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {formatCOP(total)}
          </Typography>
        </Stack>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          startIcon={<Send size={22} />}
          disabled={!canSubmit}
          loading={submitting}
          onClick={onSubmit}
          sx={{
            py: 2,
            fontSize: '1.15rem',
            fontWeight: 800,
            borderRadius: 2,
            boxShadow: 3,
            textTransform: 'none',
          }}
        >
          Enviar a cocina
        </Button>
      </Box>
    </Stack>
  );
}
