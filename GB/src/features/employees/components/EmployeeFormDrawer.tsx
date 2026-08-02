import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormDrawer from '../../../components/common/FormDrawer';
import { useRoles } from '../../../modules/roles/hooks/use-roles';
import { getRoleLabel } from '../../../modules/roles/role-labels';
import { employeeSchema, type EmployeeFormValues } from '../schemas/employeeSchema';
import type { Employee } from '../../../modules/employees/types/employee.types';

interface EmployeeFormDrawerProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: EmployeeFormValues) => void;
  initialEmployee?: Employee | null;
}

const emptyValues: EmployeeFormValues = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  roleId: '',
  hireDate: '',
  notes: '',
};

export default function EmployeeFormDrawer({
  open,
  loading,
  onClose,
  onSubmit,
  initialEmployee,
}: EmployeeFormDrawerProps) {
  const { data: roles } = useRoles();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initialEmployee
          ? {
              firstName: initialEmployee.firstName,
              lastName: initialEmployee.lastName,
              phone: initialEmployee.phone ?? '',
              email: initialEmployee.email ?? '',
              roleId: initialEmployee.roleId ?? '',
              hireDate: initialEmployee.hireDate ?? '',
              notes: initialEmployee.notes ?? '',
            }
          : emptyValues,
      );
    }
  }, [open, initialEmployee, reset]);

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      onSubmit={submit}
      title={initialEmployee ? 'Editar empleado' : 'Nuevo empleado'}
      submitLabel={initialEmployee ? 'Guardar cambios' : 'Crear empleado'}
      loading={loading ?? isSubmitting}
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
            render={({ field }) => (
              <TextField
                {...field}
                label="Apellido"
                fullWidth
                error={Boolean(errors.lastName)}
                helperText={errors.lastName?.message}
              />
            )}
          />
        </Stack>

        <Controller
          name="roleId"
          control={control}
          render={({ field }) => (
            <TextField {...field} select label="Cargo" fullWidth>
              <MenuItem value="">Sin cargo asignado</MenuItem>
              {(roles ?? []).map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {getRoleLabel(role.name)}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Stack direction="row" spacing={2}>
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
                label="Correo"
                fullWidth
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
              />
            )}
          />
        </Stack>

        <Controller
          name="hireDate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Fecha de ingreso"
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
