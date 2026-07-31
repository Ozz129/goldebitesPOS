import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormDrawer from '../../../components/common/FormDrawer';
import { rewardSchema, type RewardFormValues } from '../schemas/rewardSchema';
import type { LoyaltyReward } from '../../../modules/loyalty/types/loyalty.types';

interface RewardFormDrawerProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: RewardFormValues) => void;
  initialReward?: LoyaltyReward | null;
}

const emptyValues: RewardFormValues = { name: '', description: '', pointsCost: 100 };

export default function RewardFormDrawer({
  open,
  loading,
  onClose,
  onSubmit,
  initialReward,
}: RewardFormDrawerProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RewardFormValues>({
    resolver: zodResolver(rewardSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initialReward
          ? {
              name: initialReward.name,
              description: initialReward.description ?? '',
              pointsCost: initialReward.pointsCost,
            }
          : emptyValues,
      );
    }
  }, [open, initialReward, reset]);

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      onSubmit={submit}
      title={initialReward ? 'Editar recompensa' : 'Nueva recompensa'}
      submitLabel={initialReward ? 'Guardar cambios' : 'Crear recompensa'}
      loading={loading}
      width={420}
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
          name="description"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Descripción" multiline minRows={2} fullWidth />
          )}
        />

        <Controller
          name="pointsCost"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Costo en puntos"
              type="number"
              fullWidth
              error={Boolean(errors.pointsCost)}
              helperText={errors.pointsCost?.message}
            />
          )}
        />
      </Stack>
    </FormDrawer>
  );
}
