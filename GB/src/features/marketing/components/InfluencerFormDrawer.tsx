import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormDrawer from '../../../components/common/FormDrawer';
import { MARKETING_CHANNEL_LABELS, INFLUENCER_STATUS_LABELS } from '../../../modules/marketing/marketing-status';
import { influencerSchema, type InfluencerFormValues } from '../schemas/influencerSchema';
import type { Influencer } from '../../../modules/marketing/types/marketing.types';

interface InfluencerFormDrawerProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: InfluencerFormValues) => void;
  initialInfluencer?: Influencer | null;
}

const emptyValues: InfluencerFormValues = { name: '', channel: 'INSTAGRAM', followers: 0 };

export default function InfluencerFormDrawer({
  open,
  loading,
  onClose,
  onSubmit,
  initialInfluencer,
}: InfluencerFormDrawerProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InfluencerFormValues>({
    resolver: zodResolver(influencerSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initialInfluencer
          ? {
              name: initialInfluencer.name,
              channel: initialInfluencer.channel,
              followers: initialInfluencer.followers,
              status: initialInfluencer.status,
            }
          : emptyValues,
      );
    }
  }, [open, initialInfluencer, reset]);

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      onSubmit={submit}
      title={initialInfluencer ? 'Editar influencer' : 'Nuevo influencer'}
      submitLabel={initialInfluencer ? 'Guardar cambios' : 'Agregar influencer'}
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
              label="Perfil"
              fullWidth
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
            />
          )}
        />

        <Controller
          name="channel"
          control={control}
          render={({ field }) => (
            <TextField {...field} select label="Canal" fullWidth>
              {Object.entries(MARKETING_CHANNEL_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="followers"
          control={control}
          render={({ field }) => <TextField {...field} label="Seguidores" type="number" fullWidth />}
        />

        {initialInfluencer && (
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Estado" fullWidth>
                {Object.entries(INFLUENCER_STATUS_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        )}
      </Stack>
    </FormDrawer>
  );
}
