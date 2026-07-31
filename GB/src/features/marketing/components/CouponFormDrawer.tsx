import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormDrawer from '../../../components/common/FormDrawer';
import { couponSchema, type CouponFormValues } from '../schemas/couponSchema';
import type { Coupon } from '../../../modules/marketing/types/marketing.types';

interface CouponFormDrawerProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: CouponFormValues) => void;
  initialCoupon?: Coupon | null;
}

const emptyValues: CouponFormValues = { code: '', discountLabel: '', maxUsage: 100 };

export default function CouponFormDrawer({
  open,
  loading,
  onClose,
  onSubmit,
  initialCoupon,
}: CouponFormDrawerProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initialCoupon
          ? { code: initialCoupon.code, discountLabel: initialCoupon.discountLabel, maxUsage: initialCoupon.maxUsage }
          : emptyValues,
      );
    }
  }, [open, initialCoupon, reset]);

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      onSubmit={submit}
      title={initialCoupon ? 'Editar cupón' : 'Nuevo cupón'}
      submitLabel={initialCoupon ? 'Guardar cambios' : 'Crear cupón'}
      loading={loading}
      width={420}
    >
      <Stack spacing={2.5}>
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Código"
              fullWidth
              error={Boolean(errors.code)}
              helperText={errors.code?.message}
            />
          )}
        />

        <Controller
          name="discountLabel"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Beneficio"
              fullWidth
              error={Boolean(errors.discountLabel)}
              helperText={errors.discountLabel?.message}
            />
          )}
        />

        <Controller
          name="maxUsage"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Uso máximo"
              type="number"
              fullWidth
              error={Boolean(errors.maxUsage)}
              helperText={errors.maxUsage?.message}
            />
          )}
        />
      </Stack>
    </FormDrawer>
  );
}
