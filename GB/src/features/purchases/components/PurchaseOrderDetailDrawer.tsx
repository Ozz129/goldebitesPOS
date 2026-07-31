import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { PackageCheck, Send, Ban } from 'lucide-react';
import DetailDrawer from '../../../components/common/DetailDrawer';
import StatusChip from '../../../components/common/StatusChip';
import DateDisplay from '../../../components/common/DateDisplay';
import { Can } from '../../../modules/auth/components/can';
import { formatCOP } from '../../../utils/format';
import {
  PURCHASE_ORDER_STATUS_LABELS,
  PURCHASE_ORDER_STATUS_TONE,
} from '../../../modules/purchases/purchase-order-status';
import type {
  PurchaseOrderWithItems,
} from '../../../modules/purchases/types/purchase-order.types';

interface PurchaseOrderDetailDrawerProps {
  order: PurchaseOrderWithItems | null;
  supplierName: (supplierId: string) => string;
  onClose: () => void;
  onSubmit: (order: PurchaseOrderWithItems) => void;
  onApprove: (order: PurchaseOrderWithItems) => void;
  onCancel: (order: PurchaseOrderWithItems) => void;
  onReceive: (order: PurchaseOrderWithItems, receivedQuantities: Record<string, number>) => void;
}

export default function PurchaseOrderDetailDrawer({
  order,
  supplierName,
  onClose,
  onSubmit,
  onApprove,
  onCancel,
  onReceive,
}: PurchaseOrderDetailDrawerProps) {
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null);

  if (order && order.id !== trackedOrderId) {
    setTrackedOrderId(order.id);
    setReceivedQuantities(
      Object.fromEntries(
        order.items.map((line) => [line.id, line.quantity - line.receivedQuantity]),
      ),
    );
  }

  if (!order) return null;

  const canReceive = order.status === 'APPROVED' || order.status === 'PARTIALLY_RECEIVED';

  return (
    <DetailDrawer
      open={Boolean(order)}
      onClose={onClose}
      title={`OC-${order.orderNumber}`}
      subtitle={supplierName(order.supplierId)}
      headerExtra={
        <StatusChip
          label={PURCHASE_ORDER_STATUS_LABELS[order.status]}
          tone={PURCHASE_ORDER_STATUS_TONE[order.status]}
        />
      }
      footer={
        <Can permission="purchases.create">
          <Stack direction="row" spacing={1.5}>
            {order.status === 'DRAFT' && (
              <Button fullWidth startIcon={<Send size={16} />} onClick={() => onSubmit(order)}>
                Enviar orden
              </Button>
            )}
            <Can permission="purchases.approve">
              {order.status === 'SUBMITTED' && (
                <Button fullWidth onClick={() => onApprove(order)}>
                  Aprobar orden
                </Button>
              )}
            </Can>
            {(order.status === 'DRAFT' || order.status === 'SUBMITTED') && (
              <Can permission="purchases.cancel">
                <Button fullWidth color="error" startIcon={<Ban size={16} />} onClick={() => onCancel(order)}>
                  Cancelar
                </Button>
              </Can>
            )}
            {canReceive && (
              <Can permission="purchases.receive">
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<PackageCheck size={16} />}
                  onClick={() => onReceive(order, receivedQuantities)}
                >
                  Recibir mercancía
                </Button>
              </Can>
            )}
          </Stack>
        </Can>
      }
    >
      <Stack spacing={3}>
        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Fecha de creación
            </Typography>
            <DateDisplay value={order.orderDate} variant="body2" sx={{ fontWeight: 600 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Fecha esperada
            </Typography>
            {order.expectedDate ? (
              <DateDisplay value={order.expectedDate} variant="body2" sx={{ fontWeight: 600 }} />
            ) : (
              <Typography variant="body2">—</Typography>
            )}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Total
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {formatCOP(order.totalAmount)}
            </Typography>
          </Box>
        </Stack>

        <Divider />

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Ítems solicitados
          </Typography>
          <Stack spacing={1.5}>
            {order.items.map((line) => (
              <Stack key={line.id} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {line.inventoryItemName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Solicitado: {line.quantity} {line.unit} · {formatCOP(line.unitCost)}/{line.unit}
                  </Typography>
                </Box>
                {canReceive ? (
                  <TextField
                    size="small"
                    type="number"
                    label={`Recibir (${line.unit})`}
                    value={receivedQuantities[line.id] ?? 0}
                    onChange={(e) =>
                      setReceivedQuantities((prev) => ({ ...prev, [line.id]: Number(e.target.value) }))
                    }
                    sx={{ width: 140 }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Recibido: {line.receivedQuantity} {line.unit}
                  </Typography>
                )}
              </Stack>
            ))}
          </Stack>
        </Box>

        {order.notes && (
          <>
            <Divider />
            <Typography variant="body2" color="text.secondary">
              {order.notes}
            </Typography>
          </>
        )}
      </Stack>
    </DetailDrawer>
  );
}
