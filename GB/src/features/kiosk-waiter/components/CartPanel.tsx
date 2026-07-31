import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { Minus, Plus, Trash2, Send } from 'lucide-react';
import { formatCOP } from '../../../utils/format';
import { ORDER_TYPE_LABELS } from '../../../modules/orders/order-status';
import type { OrderType } from '../../../modules/orders/types/order.types';
import TableNumberPicker from './TableNumberPicker';

export interface CartLine {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

interface CartPanelProps {
  cart: CartLine[];
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  tableNumber: string;
  onTableNumberChange: (value: string) => void;
  orderType: OrderType;
  onOrderTypeChange: (value: OrderType) => void;
  onSubmit: () => void;
  submitting: boolean;
}

const CART_ORDER_TYPES: OrderType[] = ['DINE_IN', 'TAKEAWAY'];

export default function CartPanel({
  cart,
  onIncrement,
  onDecrement,
  onRemove,
  tableNumber,
  onTableNumberChange,
  orderType,
  onOrderTypeChange,
  onSubmit,
  submitting,
}: CartPanelProps) {
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
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
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
            </Box>
          ))
        )}
      </Stack>

      <Divider />

      <Box sx={{ p: 1.5 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Total
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            {formatCOP(total)}
          </Typography>
        </Stack>
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<Send size={18} />}
          disabled={!canSubmit}
          loading={submitting}
          onClick={onSubmit}
          sx={{ py: 1.5, fontSize: '1rem' }}
        >
          Enviar a cocina
        </Button>
      </Box>
    </Stack>
  );
}
