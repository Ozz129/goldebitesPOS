import { useEffect } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import FormDrawer from '../../../components/common/FormDrawer';
import { productSchema, type ProductFormValues } from '../schemas/productSchema';
import { useProductCategories } from '../../../modules/product-categories/hooks/use-product-categories';
import { useInventoryItems } from '../../../modules/inventory/hooks/use-inventory-items';
import { useProductRecipe } from '../../../modules/recipes/hooks/use-product-recipe';
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
  inventoryItemId: '',
  inventoryQuantity: 1,
  maxSauces: 0,
  maxSides: 0,
};

export default function ProductFormDrawer({
  open,
  onClose,
  onSubmit,
  initialProduct,
}: ProductFormDrawerProps) {
  const { data: categoriesData } = useProductCategories({ limit: 100, isActive: true });
  const categories = categoriesData?.data ?? [];
  const { data: inventoryItemsData } = useInventoryItems({ limit: 100, isActive: true });
  const inventoryItems = inventoryItemsData?.data ?? [];
  const { data: recipe, isLoading: recipeLoading } = useProductRecipe(initialProduct?.id ?? null);
  const recipeItemCount = recipe?.items.length ?? 0;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyValues,
  });

  const trackInventory = useWatch({ control, name: 'trackInventory' });
  const inventoryItemId = useWatch({ control, name: 'inventoryItemId' });

  useEffect(() => {
    if (!open) return;
    if (initialProduct && recipeLoading) return;
    const singleItem = recipeItemCount === 1 ? recipe!.items[0] : null;
    reset(
      initialProduct
        ? {
            name: initialProduct.name,
            categoryId: initialProduct.categoryId ?? '',
            description: initialProduct.description ?? '',
            sku: initialProduct.sku ?? '',
            salePrice: initialProduct.salePrice,
            trackInventory: initialProduct.trackInventory,
            inventoryItemId: singleItem?.inventoryItemId ?? '',
            inventoryQuantity: singleItem?.quantity ?? 1,
            maxSauces: initialProduct.maxSauces,
            maxSides: initialProduct.maxSides,
          }
        : emptyValues,
    );
    // recipeItemCount/recipe are derived from the same query as recipeLoading; re-running on recipe is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialProduct, recipe, recipeLoading, reset]);

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
                label="Referencia"
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

        {trackInventory && recipeItemCount > 1 && (
          <Alert severity="info">
            Este producto ya tiene una receta con varios artículos de inventario. Para editarla,
            usa "Vincular inventario" desde el detalle del producto — este formulario solo maneja
            un vínculo simple de 1 artículo.
          </Alert>
        )}

        {trackInventory && recipeItemCount <= 1 && (
          <Stack direction="row" spacing={2}>
            <Controller
              name="inventoryItemId"
              control={control}
              render={({ field }) => (
                <TextField {...field} value={field.value ?? ''} label="Artículo de inventario" select fullWidth>
                  <MenuItem value="">Sin vincular</MenuItem>
                  {inventoryItems.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name} ({item.unit})
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="inventoryQuantity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Cantidad por venta"
                  type="number"
                  fullWidth
                  disabled={!inventoryItemId}
                  error={Boolean(errors.inventoryQuantity)}
                  helperText={errors.inventoryQuantity?.message}
                  sx={{ maxWidth: 160 }}
                />
              )}
            />
          </Stack>
        )}

        <Stack direction="row" spacing={2}>
          <Controller
            name="maxSauces"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Máx. salsas"
                type="number"
                fullWidth
                helperText="0 = no ofrecer salsas"
                error={Boolean(errors.maxSauces)}
              />
            )}
          />
          <Controller
            name="maxSides"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Máx. acompañantes"
                type="number"
                fullWidth
                helperText="0 = no ofrecer acompañantes"
                error={Boolean(errors.maxSides)}
              />
            )}
          />
        </Stack>
      </Stack>
    </FormDrawer>
  );
}
