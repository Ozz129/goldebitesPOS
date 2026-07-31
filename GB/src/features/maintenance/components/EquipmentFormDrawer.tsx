import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormDrawer from '../../../components/common/FormDrawer';
import { equipmentSchema, type EquipmentFormValues } from '../schemas/equipmentSchema';
import type { Equipment } from '../../../modules/maintenance/types/maintenance.types';

interface EquipmentFormDrawerProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: EquipmentFormValues) => void;
  initialEquipment?: Equipment | null;
}

const emptyValues: EquipmentFormValues = {
  name: '',
  serialNumber: '',
  purchaseDate: '',
  warrantyUntil: '',
  technicalSupplier: '',
  nextMaintenanceAt: '',
  notes: '',
};

export default function EquipmentFormDrawer({
  open,
  loading,
  onClose,
  onSubmit,
  initialEquipment,
}: EquipmentFormDrawerProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initialEquipment
          ? {
              name: initialEquipment.name,
              serialNumber: initialEquipment.serialNumber ?? '',
              purchaseDate: initialEquipment.purchaseDate?.slice(0, 10) ?? '',
              warrantyUntil: initialEquipment.warrantyUntil?.slice(0, 10) ?? '',
              technicalSupplier: initialEquipment.technicalSupplier ?? '',
              nextMaintenanceAt: initialEquipment.nextMaintenanceAt?.slice(0, 10) ?? '',
              notes: initialEquipment.notes ?? '',
            }
          : emptyValues,
      );
    }
  }, [open, initialEquipment, reset]);

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      onSubmit={submit}
      title={initialEquipment ? 'Editar equipo' : 'Nuevo equipo'}
      submitLabel={initialEquipment ? 'Guardar cambios' : 'Crear equipo'}
      loading={loading}
      width={440}
    >
      <Stack spacing={2.5}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nombre"
              fullWidth
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
            />
          )}
        />

        <Controller
          name="serialNumber"
          control={control}
          render={({ field }) => <TextField {...field} label="Número de serie" fullWidth />}
        />

        <Stack direction="row" spacing={2}>
          <Controller
            name="purchaseDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Fecha de compra"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          />
          <Controller
            name="warrantyUntil"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Garantía hasta"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          />
        </Stack>

        <Controller
          name="technicalSupplier"
          control={control}
          render={({ field }) => <TextField {...field} label="Proveedor técnico" fullWidth />}
        />

        <Controller
          name="nextMaintenanceAt"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Próximo mantenimiento"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
        />

        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Observaciones" multiline minRows={2} fullWidth />
          )}
        />
      </Stack>
    </FormDrawer>
  );
}
