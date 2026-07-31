import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormDrawer from '../../../components/common/FormDrawer';
import { customerSchema, type CustomerFormValues } from '../schemas/customerSchema';
import type { Customer } from '../../../modules/customers/types/customer.types';

interface CustomerFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CustomerFormValues) => void;
  initialCustomer?: Customer | null;
}

const emptyValues: CustomerFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  documentNumber: '',
  notes: '',
};

export default function CustomerFormDrawer({
  open,
  onClose,
  onSubmit,
  initialCustomer,
}: CustomerFormDrawerProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initialCustomer
          ? {
              firstName: initialCustomer.firstName,
              lastName: initialCustomer.lastName ?? '',
              email: initialCustomer.email ?? '',
              phone: initialCustomer.phone ?? '',
              documentNumber: initialCustomer.documentNumber ?? '',
              notes: initialCustomer.notes ?? '',
            }
          : emptyValues,
      );
    }
  }, [open, initialCustomer, reset]);

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      onSubmit={submit}
      title={initialCustomer ? 'Editar cliente' : 'Nuevo cliente'}
      submitLabel={initialCustomer ? 'Guardar cambios' : 'Crear cliente'}
      loading={isSubmitting}
      width={440}
    >
      <Stack spacing={2.5}>
        <Stack direction="row" spacing={2}>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre"
                fullWidth
                error={Boolean(errors.firstName)}
                helperText={errors.firstName?.message}
              />
            )}
          />
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => <TextField {...field} label="Apellido" fullWidth />}
          />
        </Stack>

        <Controller
          name="phone"
          control={control}
          render={({ field }) => <TextField {...field} label="Teléfono" fullWidth />}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Correo electrónico"
              fullWidth
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
          )}
        />

        <Controller
          name="documentNumber"
          control={control}
          render={({ field }) => <TextField {...field} label="Documento" fullWidth />}
        />

        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Notas" multiline minRows={2} fullWidth />
          )}
        />
      </Stack>
    </FormDrawer>
  );
}
