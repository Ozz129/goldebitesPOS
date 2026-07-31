import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import FormDrawer from '../../../components/common/FormDrawer';
import { productSchema, type ProductFormValues } from '../schemas/productSchema';
import { useProductCategories } from '../../../modules/product-categories/hooks/use-product-categories';
import type { Product } from '../../../modules/products/types/product.types';

interface ProductFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
  initialProduct?: Product | null;
}

const emptyValues: ProductFormValues = {
  name: '',
  categoryId: '',
  description: '',
  sku: '',
  salePrice: 0,
  trackInventory: true,
};

export default function ProductFormDrawer({
  open,
  onClose,
  onSubmit,
  initialProduct,
}: ProductFormDrawerProps) {
  const { data: categoriesData } = useProductCategories({ limit: 100, isActive: true });
  const categories = categoriesData?.data ?? [];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initialProduct
          ? {
              name: initialProduct.name,
              categoryId: initialProduct.categoryId ?? '',
              description: initialProduct.description ?? '',
              sku: initialProduct.sku ?? '',
              salePrice: initialProduct.salePrice,
              trackInventory: initialProduct.trackInventory,
            }
          : emptyValues,
      );
    }
  }, [open, initialProduct, reset]);

  const submit = handleSubmit((values) => {
    onSubmit(values);
  });

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      onSubmit={submit}
      title={initialProduct ? 'Editar producto' : 'Nuevo producto'}
      subtitle="Nombre, precio y disponibilidad del producto en el menú."
      submitLabel={initialProduct ? 'Guardar cambios' : 'Crear producto'}
      loading={isSubmitting}
      width={480}
    >
      <Stack spacing={2.5}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nombre del producto"
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
            <TextField
              {...field}
              label="Descripción"
              multiline
              minRows={2}
              fullWidth
              error={Boolean(errors.description)}
              helperText={errors.description?.message}
            />
          )}
        />

        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <TextField {...field} value={field.value ?? ''} label="Categoría" select fullWidth>
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
            render={({ field }) => (
              <TextField
                {...field}
                label="SKU"
                fullWidth
                error={Boolean(errors.sku)}
                helperText={errors.sku?.message}
              />
            )}
          />
          <Controller
            name="salePrice"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Precio de venta (COP)"
                type="number"
                fullWidth
                error={Boolean(errors.salePrice)}
                helperText={errors.salePrice?.message}
              />
            )}
          />
        </Stack>

        <Controller
          name="trackInventory"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
              }
              label="Controla inventario"
            />
          )}
        />
      </Stack>
    </FormDrawer>
  );
}
