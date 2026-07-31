import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormDrawer from '../../../components/common/FormDrawer';
import { roleSchema, type RoleFormValues } from '../schemas/roleSchema';
import type { Role } from '../../../modules/roles/types/role.types';

interface RoleFormDrawerProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: RoleFormValues) => void;
  initialRole?: Role | null;
}

const emptyValues: RoleFormValues = { name: '', description: '' };

export default function RoleFormDrawer({
  open,
  loading,
  onClose,
  onSubmit,
  initialRole,
}: RoleFormDrawerProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initialRole
          ? { name: initialRole.name, description: initialRole.description ?? '' }
          : emptyValues,
      );
    }
  }, [open, initialRole, reset]);

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      onSubmit={submit}
      title={initialRole ? 'Editar rol' : 'Nuevo rol'}
      submitLabel={initialRole ? 'Guardar cambios' : 'Crear rol'}
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
      </Stack>
    </FormDrawer>
  );
}
