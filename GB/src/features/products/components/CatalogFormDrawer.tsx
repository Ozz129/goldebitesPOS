import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormDrawer from '../../../components/common/FormDrawer';
import { catalogSchema, type CatalogFormValues } from '../schemas/catalogSchema';

interface CatalogItem {
  name: string;
  description: string | null;
  displayOrder: number;
}

interface CatalogFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CatalogFormValues) => void;
  initialItem?: CatalogItem | null;
  entityLabel: string;
  gender: 'f' | 'm';
  submitting?: boolean;
}

const emptyValues: CatalogFormValues = {
  name: '',
  description: '',
  displayOrder: 0,
};

export default function CatalogFormDrawer({
  open,
  onClose,
  onSubmit,
  initialItem,
  entityLabel,
  gender,
  submitting,
}: CatalogFormDrawerProps) {
  const newArticle = gender === 'f' ? 'Nueva' : 'Nuevo';
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CatalogFormValues>({
    resolver: zodResolver(catalogSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initialItem
          ? {
              name: initialItem.name,
              description: initialItem.description ?? '',
              displayOrder: initialItem.displayOrder,
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
      title={initialItem ? `Editar ${entityLabel}` : `${newArticle} ${entityLabel}`}
      submitLabel={initialItem ? 'Guardar cambios' : `Crear ${entityLabel}`}
      loading={submitting}
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
          name="displayOrder"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Orden de aparición"
              type="number"
              fullWidth
              error={Boolean(errors.displayOrder)}
              helperText={errors.displayOrder?.message}
            />
          )}
        />
      </Stack>
    </FormDrawer>
  );
}
