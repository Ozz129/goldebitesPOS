import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormDrawer from '../../../components/common/FormDrawer';
import { EXPENSE_CATEGORY_LABELS } from '../../../modules/finances/expense-category';
import { expenseSchema, type ExpenseFormValues } from '../schemas/expenseSchema';
import type { Expense } from '../../../modules/finances/types/expense.types';

interface ExpenseFormDrawerProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: ExpenseFormValues) => void;
  initialExpense?: Expense | null;
}

const emptyValues: ExpenseFormValues = {
  category: 'OPERATING',
  description: '',
  amount: 0,
  expenseDate: new Date().toISOString().slice(0, 10),
};

export default function ExpenseFormDrawer({
  open,
  loading,
  onClose,
  onSubmit,
  initialExpense,
}: ExpenseFormDrawerProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initialExpense
          ? {
              category: initialExpense.category,
              description: initialExpense.description,
              amount: initialExpense.amount,
              expenseDate: initialExpense.expenseDate.slice(0, 10),
            }
          : emptyValues,
      );
    }
  }, [open, initialExpense, reset]);

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      onSubmit={submit}
      title={initialExpense ? 'Editar gasto' : 'Nuevo gasto'}
      submitLabel={initialExpense ? 'Guardar cambios' : 'Registrar gasto'}
      loading={loading}
      width={420}
    >
      <Stack spacing={2.5}>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <TextField {...field} select label="Categoría" fullWidth>
              {Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Descripción"
              fullWidth
              error={Boolean(errors.description)}
              helperText={errors.description?.message}
            />
          )}
        />

        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Monto (COP)"
              type="number"
              fullWidth
              error={Boolean(errors.amount)}
              helperText={errors.amount?.message}
            />
          )}
        />

        <Controller
          name="expenseDate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Fecha"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              error={Boolean(errors.expenseDate)}
              helperText={errors.expenseDate?.message}
            />
          )}
        />
      </Stack>
    </FormDrawer>
  );
}
