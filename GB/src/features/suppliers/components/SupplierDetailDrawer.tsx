import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Phone, Mail, MapPin, Pencil, Power } from 'lucide-react';
import DetailDrawer from '../../../components/common/DetailDrawer';
import StatusChip from '../../../components/common/StatusChip';
import { Can } from '../../../modules/auth/components/can';
import type { Supplier } from '../../../modules/suppliers/types/supplier.types';

interface SupplierDetailDrawerProps {
  supplier: Supplier | null;
  onClose: () => void;
  onEdit: (supplier: Supplier) => void;
  onToggleStatus: (supplier: Supplier) => void;
}

export default function SupplierDetailDrawer({
  supplier,
  onClose,
  onEdit,
  onToggleStatus,
}: SupplierDetailDrawerProps) {
  if (!supplier) return null;

  return (
    <DetailDrawer
      open={Boolean(supplier)}
      onClose={onClose}
      title={supplier.name}
      subtitle={supplier.taxId ? `NIT ${supplier.taxId}` : undefined}
      headerExtra={
        <StatusChip
          label={supplier.isActive ? 'Activo' : 'Inactivo'}
          tone={supplier.isActive ? 'success' : 'neutral'}
        />
      }
      footer={
        <Can permission="suppliers.manage">
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
            <Button startIcon={<Power size={16} />} onClick={() => onToggleStatus(supplier)}>
              {supplier.isActive ? 'Desactivar' : 'Activar'}
            </Button>
            <Button variant="contained" startIcon={<Pencil size={16} />} onClick={() => onEdit(supplier)}>
              Editar proveedor
            </Button>
          </Stack>
        </Can>
      }
    >
      <Stack spacing={3}>
        {supplier.contactName && (
          <Typography variant="body2" color="text.secondary">
            Contacto: {supplier.contactName}
          </Typography>
        )}
        <Stack spacing={1}>
          {supplier.phone && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <Phone size={14} />
              <Typography variant="body2">{supplier.phone}</Typography>
            </Stack>
          )}
          {supplier.email && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <Mail size={14} />
              <Typography variant="body2">{supplier.email}</Typography>
            </Stack>
          )}
          {supplier.address && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', color: 'text.secondary' }}>
              <MapPin size={14} style={{ marginTop: 3 }} />
              <Typography variant="body2">{supplier.address}</Typography>
            </Stack>
          )}
        </Stack>
        {supplier.notes && (
          <Typography variant="body2" color="text.secondary">
            {supplier.notes}
          </Typography>
        )}
      </Stack>
    </DetailDrawer>
  );
}
