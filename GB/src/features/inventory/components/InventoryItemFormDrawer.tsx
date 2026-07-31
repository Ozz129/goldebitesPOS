import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormDrawer from '../../../components/common/FormDrawer';
import { useInventoryItemCategories } from '../../../modules/inventory-item-categories/hooks/use-inventory-item-categories';
import { inventoryItemSchema, type InventoryItemFormValues } from '../schemas/inventoryItemSchema';
import type { InventoryItem } from '../../../modules/inventory/types/inventory.types';

interface InventoryItemFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: InventoryItemFormValues) => void;
  initialItem?: InventoryItem | null;
}

const emptyValues: InventoryItemFormValues = {
  categoryId: '',
  name: '',
  sku: '',
  unit: '',
  minimumStock: 0,
  currentCost: 0,
};

export default function InventoryItemFormDrawer({
  open,
  onClose,
  onSubmit,
  initialItem,
}: InventoryItemFormDrawerProps) {
  const { data: categoriesData } = useInventoryItemCategories({ isActive: true, limit: 100 });
  const categories = categoriesData?.data ?? [];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initialItem
          ? {
              categoryId: initialItem.categoryId ?? '',
              name: initialItem.name,
              sku: initialItem.sku ?? '',
              unit: initialItem.unit,
              minimumStock: initialItem.minimumStock,
              currentCost: initialItem.currentCost,
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
      title={initialItem ? 'Editar insumo' : 'Nuevo insumo'}
      submitLabel={initialItem ? 'Guardar cambios' : 'Crear insumo'}
      loading={isSubmitting}
      width={440}
    >
      <Stack spacing={2.5}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nombre del insumo"
              fullWidth
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
            />
          )}
        />

        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <TextField {...field} select label="Categoría" fullWidth>
              <MenuItem value="">Sin categoría</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Stack direction="row" spacing={2}>
          <Controller
            name="sku"
            control={control}
            render={({ field }) => <TextField {...field} label="SKU" fullWidth />}
          />
          <Controller
            name="unit"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Unidad (kg, l, unid.)"
                fullWidth
                error={Boolean(errors.unit)}
                helperText={errors.unit?.message}
              />
            )}
          />
        </Stack>

        <Stack direction="row" spacing={2}>
          <Controller
            name="minimumStock"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Stock mínimo" type="number" fullWidth />
            )}
          />
          <Controller
            name="currentCost"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Costo actual (COP)" type="number" fullWidth />
            )}
          />
        </Stack>
      </Stack>
    </FormDrawer>
  );
}
