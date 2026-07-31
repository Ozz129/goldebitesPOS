import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Phone, Mail, IdCard, MapPin, Pencil, Trash2 } from 'lucide-react';
import DetailDrawer from '../../../components/common/DetailDrawer';
import CurrencyDisplay from '../../../components/common/CurrencyDisplay';
import { Can } from '../../../modules/auth/components/can';
import { useCustomerAddresses } from '../../../modules/customers/hooks/use-customer-addresses';
import type { Customer } from '../../../modules/customers/types/customer.types';

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onSaveNotes: (customer: Customer, notes: string) => void;
}

export default function CustomerDetailDrawer({
  customer,
  onClose,
  onEdit,
  onDelete,
  onSaveNotes,
}: CustomerDetailDrawerProps) {
  const [notes, setNotes] = useState('');
  const [trackedCustomerId, setTrackedCustomerId] = useState<string | null>(null);
  const { data: addresses = [] } = useCustomerAddresses(customer?.id ?? null);

  // Re-seed the notes field whenever a different customer is opened (derived during render, not an effect).
  if (customer && customer.id !== trackedCustomerId) {
    setTrackedCustomerId(customer.id);
    setNotes(customer.notes ?? '');
  }

  if (!customer) return null;

  const fullName = `${customer.firstName} ${customer.lastName ?? ''}`.trim();

  return (
    <DetailDrawer
      open={Boolean(customer)}
      onClose={onClose}
      title={fullName}
      subtitle={`${customer.totalOrders} pedidos`}
      footer={
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
          <Can permission="orders.update">
            <Button color="error" startIcon={<Trash2 size={16} />} onClick={() => onDelete(customer)}>
              Eliminar
            </Button>
            <Button variant="contained" startIcon={<Pencil size={16} />} onClick={() => onEdit(customer)}>
              Editar cliente
            </Button>
          </Can>
        </Stack>
      }
    >
      <Stack spacing={3}>
        <Stack spacing={1}>
          {customer.phone && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <Phone size={14} />
              <Typography variant="body2">{customer.phone}</Typography>
            </Stack>
          )}
          {customer.email && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <Mail size={14} />
              <Typography variant="body2">{customer.email}</Typography>
            </Stack>
          )}
          {customer.documentNumber && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <IdCard size={14} />
              <Typography variant="body2">{customer.documentNumber}</Typography>
            </Stack>
          )}
          {addresses.map((addr) => (
            <Stack
              key={addr.id}
              direction="row"
              spacing={1}
              sx={{ alignItems: 'flex-start', color: 'text.secondary' }}
            >
              <MapPin size={14} style={{ marginTop: 3 }} />
              <Typography variant="body2">
                {addr.label ? `${addr.label}: ` : ''}
                {addr.address}
                {addr.city ? `, ${addr.city}` : ''}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Divider />

        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Total gastado
            </Typography>
            <CurrencyDisplay value={customer.totalSpent} variant="h6" sx={{ fontWeight: 700 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Ticket promedio
            </Typography>
            <CurrencyDisplay
              value={customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0}
              variant="h6"
              sx={{ fontWeight: 700 }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Puntos
            </Typography>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
              {customer.loyaltyPoints}
            </Typography>
          </Box>
        </Stack>

        <Divider />

        <Stack spacing={1.5}>
          <TextField
            label="Notas del cliente"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
          <Can permission="orders.update">
            <Button
              variant="outlined"
              disabled={notes === (customer.notes ?? '')}
              onClick={() => onSaveNotes(customer, notes)}
            >
              Guardar notas
            </Button>
          </Can>
        </Stack>
      </Stack>
    </DetailDrawer>
  );
}
