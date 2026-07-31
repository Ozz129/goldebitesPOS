import { useEffect } from 'react';
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
import {
  purchaseOrderSchema,
  type PurchaseOrderFormValues,
} from '../schemas/purchaseOrderSchema';
import { formatCOP } from '../../../utils/format';
import type { Supplier } from '../../../modules/suppliers/types/supplier.types';
import type { InventoryItem } from '../../../modules/inventory/types/inventory.types';

interface PurchaseOrderFormDrawerProps {
  open: boolean;
  loading?: boolean;
  suppliers: Supplier[];
  inventoryItems: InventoryItem[];
  initialItems?: PurchaseOrderFormValues['items'];
  onClose: () => void;
  onSubmit: (values: PurchaseOrderFormValues) => void;
}

const baseDefaults: PurchaseOrderFormValues = {
  supplierId: '',
  expectedDate: '',
  notes: '',
  items: [{ inventoryItemId: '', quantity: 1, unitCost: 0 }],
};

export default function PurchaseOrderFormDrawer({
  open,
  loading,
  suppliers,
  inventoryItems,
  initialItems,
  onClose,
  onSubmit,
}: PurchaseOrderFormDrawerProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: baseDefaults,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form's watch() is inherently non-memoizable; this is expected.
  const items = watch('items');

  useEffect(() => {
    if (open) {
      reset({
        ...baseDefaults,
        items: initialItems && initialItems.length > 0 ? initialItems : baseDefaults.items,
      });
    }
  }, [open, initialItems, reset]);

  const itemById = new Map(inventoryItems.map((i) => [i.id, i]));
  const estimatedTotal = items.reduce((sum, line) => sum + (line.quantity || 0) * (line.unitCost || 0), 0);

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      onSubmit={submit}
      title="Nueva orden de compra"
      subtitle="Selecciona el proveedor y los insumos a solicitar."
      submitLabel="Crear orden"
      loading={loading ?? isSubmitting}
      width={560}
    >
      <Stack spacing={2.5}>
        <Controller
          name="supplierId"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Proveedor"
              fullWidth
              error={Boolean(errors.supplierId)}
              helperText={errors.supplierId?.message}
            >
              <MenuItem value="">Selecciona…</MenuItem>
              {suppliers.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="expectedDate"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Fecha esperada" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          )}
        />

        <Divider />

        <Box>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Insumos
            </Typography>
            <Button
              size="small"
              startIcon={<Plus size={14} />}
              onClick={() => append({ inventoryItemId: '', quantity: 1, unitCost: 0 })}
            >
              Agregar insumo
            </Button>
          </Stack>
          {errors.items?.root && (
            <Typography variant="caption" color="error">
              {errors.items.root.message}
            </Typography>
          )}
          <Stack spacing={1.5}>
            {fields.map((field, index) => (
              <Stack key={field.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Controller
                  name={`items.${index}.inventoryItemId`}
                  control={control}
                  render={({ field: selectField }) => (
                    <TextField {...selectField} select label="Insumo" fullWidth size="small">
                      <MenuItem value="">Selecciona…</MenuItem>
                      {inventoryItems.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name={`items.${index}.quantity`}
                  control={control}
                  render={({ field: qtyField }) => (
                    <TextField
                      {...qtyField}
                      label={`Cant.${itemById.get(items[index]?.inventoryItemId)?.unit ? ` (${itemById.get(items[index].inventoryItemId)?.unit})` : ''}`}
                      type="number"
                      size="small"
                      sx={{ width: 120 }}
                    />
                  )}
                />
                <Controller
                  name={`items.${index}.unitCost`}
                  control={control}
                  render={({ field: costField }) => (
                    <TextField {...costField} label="Costo unit." type="number" size="small" sx={{ width: 130 }} />
                  )}
                />
                <IconButton size="small" onClick={() => remove(index)} disabled={fields.length === 1}>
                  <Trash2 size={15} />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Notas" multiline minRows={2} fullWidth />
          )}
        />

        <Stack direction="row" sx={{ justifyContent: 'space-between', pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total estimado
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {formatCOP(estimatedTotal)}
          </Typography>
        </Stack>
      </Stack>
    </FormDrawer>
  );
}
