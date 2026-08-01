import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { Plus, Trash2 } from 'lucide-react';
import FormDrawer from '../../../components/common/FormDrawer';
import { newOrderSchema, type NewOrderFormValues } from '../schemas/orderSchema';
import { ORDER_TYPE_LABELS } from '../../../modules/orders/order-status';
import { useProducts } from '../../../modules/products/hooks/use-products';
import { useCustomers } from '../../../modules/customers/hooks/use-customers';
import { formatCOP } from '../../../utils/format';

interface NewOrderDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewOrderFormValues) => void;
}

const defaultValues: NewOrderFormValues = {
  customerId: '',
  orderType: 'DINE_IN',
  tableNumber: '',
  deliveryAddress: '',
  deliveryInstructions: '',
  discountAmount: 0,
  deliveryFee: 0,
  notes: '',
  items: [{ productId: '', quantity: 1, notes: '' }],
};

export default function NewOrderDrawer({ open, onClose, onSubmit }: NewOrderDrawerProps) {
  const { data: productsData } = useProducts({ limit: 100, isActive: true });
  const products = useMemo(() => productsData?.data ?? [], [productsData]);
  const { data: customersData } = useCustomers({ limit: 100 });
  const customers = customersData?.data ?? [];

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NewOrderFormValues>({ resolver: zodResolver(newOrderSchema), defaultValues });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form's watch() is inherently non-memoizable; this is expected.
  const orderType = watch('orderType');
  const items = watch('items');

  useEffect(() => {
    if (open) reset(defaultValues);
  }, [open, reset]);

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const estimatedSubtotal = items.reduce((sum, item) => {
    const product = productById.get(item.productId);
    return product ? sum + product.salePrice * (item.quantity || 0) : sum;
  }, 0);

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      onSubmit={submit}
      title="Nuevo pedido"
      subtitle="Registra un pedido manual en mesa, para recoger o a domicilio."
      submitLabel="Crear pedido"
      loading={isSubmitting}
      width={560}
    >
      <Stack spacing={2.5}>
        <Controller
          name="customerId"
          control={control}
          render={({ field }) => (
            <TextField {...field} value={field.value ?? ''} label="Cliente (opcional)" select fullWidth>
              <MenuItem value="">Cliente ocasional</MenuItem>
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.firstName} {c.lastName ?? ''}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="orderType"
          control={control}
          render={({ field }) => (
            <TextField {...field} select label="Tipo de pedido" fullWidth>
              {Object.entries(ORDER_TYPE_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        {(orderType === 'DINE_IN' || orderType === 'CAR_SERVICE') && (
          <Controller
            name="tableNumber"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={orderType === 'CAR_SERVICE' ? 'Placa del vehículo' : 'Número de mesa'}
                fullWidth
              />
            )}
          />
        )}

        {orderType === 'DELIVERY' && (
          <Stack spacing={2}>
            <Controller
              name="deliveryAddress"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Dirección de entrega"
                  fullWidth
                  error={Boolean(errors.deliveryAddress)}
                  helperText={errors.deliveryAddress?.message}
                />
              )}
            />
            <Controller
              name="deliveryInstructions"
              control={control}
              render={({ field }) => <TextField {...field} label="Instrucciones de entrega" fullWidth />}
            />
            <Controller
              name="deliveryFee"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Costo de domicilio (COP)" type="number" fullWidth />
              )}
            />
          </Stack>
        )}

        <Divider />

        <Box>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Productos
            </Typography>
            <Button
              size="small"
              startIcon={<Plus size={14} />}
              onClick={() => append({ productId: '', quantity: 1, notes: '' })}
            >
              Agregar producto
            </Button>
          </Stack>
          {errors.items?.root && (
            <Typography variant="caption" color="error">
              {errors.items.root.message}
            </Typography>
          )}
          <Stack spacing={1.5}>
            {fields.map((field, index) => (
              <Stack key={field.id} spacing={1}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Controller
                    name={`items.${index}.productId`}
                    control={control}
                    render={({ field: selectField }) => (
                      <TextField {...selectField} select label="Producto" fullWidth size="small">
                        <MenuItem value="">Selecciona…</MenuItem>
                        {products.map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.name} — {formatCOP(p.salePrice)}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                  <Controller
                    name={`items.${index}.quantity`}
                    control={control}
                    render={({ field: qtyField }) => (
                      <TextField {...qtyField} label="Cant." type="number" size="small" sx={{ width: 90 }} />
                    )}
                  />
                  <IconButton size="small" onClick={() => remove(index)} disabled={fields.length === 1}>
                    <Trash2 size={15} />
                  </IconButton>
                </Stack>
                <Controller
                  name={`items.${index}.notes`}
                  control={control}
                  render={({ field: notesField }) => (
                    <TextField {...notesField} label="Nota del producto (opcional)" size="small" fullWidth />
                  )}
                />
              </Stack>
            ))}
          </Stack>
        </Box>

        <Divider />

        <Controller
          name="discountAmount"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Descuento (COP)" type="number" fullWidth />
          )}
        />

        <Controller
          name="notes"
          control={control}
          render={({ field }) => <TextField {...field} label="Notas del pedido" multiline minRows={2} fullWidth />}
        />

        <Stack direction="row" sx={{ justifyContent: 'space-between', pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Subtotal estimado
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {formatCOP(estimatedSubtotal)}
          </Typography>
        </Stack>
      </Stack>
    </FormDrawer>
  );
}
