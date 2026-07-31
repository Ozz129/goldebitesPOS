import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormDrawer from '../../../components/common/FormDrawer';
import { MARKETING_CHANNEL_LABELS, CONTENT_STATUS_LABELS } from '../../../modules/marketing/marketing-status';
import { contentItemSchema, type ContentItemFormValues } from '../schemas/contentItemSchema';
import type { ContentItem } from '../../../modules/marketing/types/marketing.types';

interface ContentItemFormDrawerProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: ContentItemFormValues) => void;
  initialItem?: ContentItem | null;
}

const emptyValues: ContentItemFormValues = { scheduledDate: '', title: '', channel: 'INSTAGRAM' };

export default function ContentItemFormDrawer({
  open,
  loading,
  onClose,
  onSubmit,
  initialItem,
}: ContentItemFormDrawerProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContentItemFormValues>({
    resolver: zodResolver(contentItemSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initialItem
          ? {
              scheduledDate: initialItem.scheduledDate.slice(0, 10),
              title: initialItem.title,
              channel: initialItem.channel,
              status: initialItem.status,
            }
          : emptyValues,
      );
    }
  }, [open, initialItem, reset]);

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      onSubmit={submit}
      title={initialItem ? 'Editar contenido' : 'Nuevo contenido'}
      submitLabel={initialItem ? 'Guardar cambios' : 'Programar contenido'}
      loading={loading}
      width={420}
    >
      <Stack spacing={2.5}>
        <Controller
          name="scheduledDate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Fecha programada"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              error={Boolean(errors.scheduledDate)}
              helperText={errors.scheduledDate?.message}
            />
          )}
        />

        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Título"
              fullWidth
              error={Boolean(errors.title)}
              helperText={errors.title?.message}
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

        {initialItem && (
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Estado" fullWidth>
                {Object.entries(CONTENT_STATUS_LABELS).map(([value, label]) => (
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
