import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import FormDrawer from '../../../components/common/FormDrawer';
import { MARKETING_CHANNEL_LABELS, CAMPAIGN_STATUS_LABELS } from '../../../modules/marketing/marketing-status';
import { campaignSchema, type CampaignFormValues } from '../schemas/campaignSchema';
import type { Campaign } from '../../../modules/marketing/types/marketing.types';

interface CampaignFormDrawerProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: CampaignFormValues) => void;
  initialCampaign?: Campaign | null;
}

const emptyValues: CampaignFormValues = { name: '', channel: 'INSTAGRAM', budget: 0 };

export default function CampaignFormDrawer({
  open,
  loading,
  onClose,
  onSubmit,
  initialCampaign,
}: CampaignFormDrawerProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initialCampaign
          ? {
              name: initialCampaign.name,
              channel: initialCampaign.channel,
              budget: initialCampaign.budget,
              startDate: initialCampaign.startDate?.slice(0, 10) ?? '',
              endDate: initialCampaign.endDate?.slice(0, 10) ?? '',
              status: initialCampaign.status,
              spent: initialCampaign.spent,
              reach: initialCampaign.reach,
              clicks: initialCampaign.clicks,
              conversions: initialCampaign.conversions,
            }
          : emptyValues,
      );
    }
  }, [open, initialCampaign, reset]);

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      onSubmit={submit}
      title={initialCampaign ? 'Editar campaña' : 'Nueva campaña'}
      submitLabel={initialCampaign ? 'Guardar cambios' : 'Crear campaña'}
      loading={loading}
      width={440}
    >
      <Stack spacing={2.5}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Nombre" fullWidth error={Boolean(errors.name)} helperText={errors.name?.message} />
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
          name="budget"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Presupuesto (COP)"
              type="number"
              fullWidth
              error={Boolean(errors.budget)}
              helperText={errors.budget?.message}
            />
          )}
        />

        <Stack direction="row" spacing={2}>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Fecha de inicio" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            )}
          />
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Fecha de fin" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            )}
          />
        </Stack>

        {initialCampaign && (
          <>
            <Divider />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Métricas de desempeño
            </Typography>

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Estado" fullWidth>
                  {Object.entries(CAMPAIGN_STATUS_LABELS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="spent"
              control={control}
              render={({ field }) => <TextField {...field} label="Invertido (COP)" type="number" fullWidth />}
            />

            <Stack direction="row" spacing={2}>
              <Controller
                name="reach"
                control={control}
                render={({ field }) => <TextField {...field} label="Alcance" type="number" fullWidth />}
              />
              <Controller
                name="clicks"
                control={control}
                render={({ field }) => <TextField {...field} label="Clics" type="number" fullWidth />}
              />
            </Stack>

            <Controller
              name="conversions"
              control={control}
              render={({ field }) => <TextField {...field} label="Conversiones" type="number" fullWidth />}
            />
          </>
        )}
      </Stack>
    </FormDrawer>
  );
}
