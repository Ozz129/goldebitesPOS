import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useSnackbar } from 'notistack';
import DetailDrawer from '../../../components/common/DetailDrawer';
import StatusChip from '../../../components/common/StatusChip';
import DateDisplay from '../../../components/common/DateDisplay';
import { Can } from '../../../modules/auth/components/can';
import { formatCOP } from '../../../utils/format';
import { useEquipmentDetail } from '../../../modules/maintenance/hooks/use-equipment-detail';
import { useSetEquipmentStatus } from '../../../modules/maintenance/hooks/use-set-equipment-status';
import { useAddIntervention } from '../../../modules/maintenance/hooks/use-add-intervention';
import { useRemoveIntervention } from '../../../modules/maintenance/hooks/use-remove-intervention';
import { normalizeApiError } from '../../../lib/api/api-error';
import { EQUIPMENT_STATUS_LABELS, EQUIPMENT_STATUS_TONE } from '../../../modules/maintenance/equipment-status';
import type { Equipment, EquipmentStatus } from '../../../modules/maintenance/types/maintenance.types';

interface EquipmentDetailDrawerProps {
  equipmentId: string | null;
  onClose: () => void;
  onEdit: (equipment: Equipment) => void;
  onDelete: (equipment: Equipment) => void;
}

export default function EquipmentDetailDrawer({
  equipmentId,
  onClose,
  onEdit,
  onDelete,
}: EquipmentDetailDrawerProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { data: equipment } = useEquipmentDetail(equipmentId);
  const setStatus = useSetEquipmentStatus();
  const addIntervention = useAddIntervention();
  const removeIntervention = useRemoveIntervention();

  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [now] = useState(() => Date.now());

  if (!equipmentId || !equipment) return null;

  const overdue = equipment.nextMaintenanceAt
    ? new Date(equipment.nextMaintenanceAt).getTime() < now
    : false;

  const handleAddIntervention = () => {
    if (!date || !description) return;
    addIntervention.mutate(
      { id: equipment.id, payload: { date, description, cost: Number(cost) || 0 } },
      {
        onSuccess: () => {
          enqueueSnackbar('Intervención registrada', { variant: 'success' });
          setDate('');
          setDescription('');
          setCost('');
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  };

  return (
    <DetailDrawer
      open={Boolean(equipmentId)}
      onClose={onClose}
      title={equipment.name}
      subtitle={equipment.serialNumber ? `Serial: ${equipment.serialNumber}` : undefined}
      headerExtra={
        <StatusChip label={EQUIPMENT_STATUS_LABELS[equipment.status]} tone={EQUIPMENT_STATUS_TONE[equipment.status]} />
      }
      footer={
        <Can permission="maintenance.manage">
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
            <Button color="error" startIcon={<Trash2 size={16} />} onClick={() => onDelete(equipment)}>
              Eliminar
            </Button>
            <Button variant="contained" startIcon={<Pencil size={16} />} onClick={() => onEdit(equipment)}>
              Editar
            </Button>
          </Stack>
        </Can>
      }
    >
      <Stack spacing={3}>
        <Can permission="maintenance.manage">
          <TextField
            select
            size="small"
            label="Estado"
            value={equipment.status}
            onChange={(e) =>
              setStatus.mutate(
                { id: equipment.id, status: e.target.value as EquipmentStatus },
                { onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }) },
              )
            }
            fullWidth
          >
            {Object.entries(EQUIPMENT_STATUS_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Can>

        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Fecha de compra
            </Typography>
            {equipment.purchaseDate ? (
              <DateDisplay value={equipment.purchaseDate} variant="body2" sx={{ fontWeight: 600 }} />
            ) : (
              <Typography variant="body2">—</Typography>
            )}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Garantía hasta
            </Typography>
            {equipment.warrantyUntil ? (
              <DateDisplay value={equipment.warrantyUntil} variant="body2" sx={{ fontWeight: 600 }} />
            ) : (
              <Typography variant="body2">—</Typography>
            )}
          </Box>
        </Stack>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Próximo mantenimiento
          </Typography>
          {equipment.nextMaintenanceAt ? (
            <DateDisplay
              value={equipment.nextMaintenanceAt}
              variant="body2"
              color={overdue ? 'error.main' : undefined}
              sx={{ fontWeight: 600 }}
            />
          ) : (
            <Typography variant="body2">—</Typography>
          )}
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Proveedor técnico
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {equipment.technicalSupplier ?? '—'}
          </Typography>
        </Box>

        {equipment.notes && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Observaciones
            </Typography>
            <Typography variant="body2">{equipment.notes}</Typography>
          </Box>
        )}

        <Divider />

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Historial de intervenciones
          </Typography>
          {equipment.interventions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Sin intervenciones registradas.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {equipment.interventions.map((intervention) => (
                <Stack key={intervention.id} direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2">{intervention.description}</Typography>
                    <DateDisplay value={intervention.date} variant="caption" color="text.secondary" />
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {intervention.cost > 0 ? formatCOP(intervention.cost) : '—'}
                    </Typography>
                    <Can permission="maintenance.manage">
                      <IconButton
                        size="small"
                        aria-label="Eliminar intervención"
                        onClick={() => removeIntervention.mutate({ id: equipment.id, interventionId: intervention.id })}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </Can>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}

          <Can permission="maintenance.manage">
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  type="date"
                  label="Fecha"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Costo"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  sx={{ flex: 1 }}
                />
              </Stack>
              <TextField
                size="small"
                label="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
              />
              <Button
                size="small"
                variant="outlined"
                startIcon={<Plus size={16} />}
                loading={addIntervention.isPending}
                disabled={!date || !description}
                onClick={handleAddIntervention}
                sx={{ alignSelf: 'flex-start' }}
              >
                Registrar intervención
              </Button>
            </Stack>
          </Can>
        </Box>
      </Stack>
    </DetailDrawer>
  );
}
