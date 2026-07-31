import { useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { Plus } from 'lucide-react';
import { useSnackbar } from 'notistack';
import PageHeader from '../../../components/common/PageHeader';
import FilterBar from '../../../components/common/FilterBar';
import SearchInput from '../../../components/common/SearchInput';
import EmptyState from '../../../components/common/EmptyState';
import ErrorState from '../../../components/common/ErrorState';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { Can } from '../../../modules/auth/components/can';
import { useProducts } from '../../../modules/products/hooks/use-products';
import { useCreateProduct } from '../../../modules/products/hooks/use-create-product';
import { useUpdateProduct } from '../../../modules/products/hooks/use-update-product';
import { useDeleteProduct } from '../../../modules/products/hooks/use-delete-product';
import { useSetProductStatus } from '../../../modules/products/hooks/use-set-product-status';
import { useProductCategories } from '../../../modules/product-categories/hooks/use-product-categories';
import { normalizeApiError } from '../../../lib/api/api-error';
import ProductCard from '../components/ProductCard';
import ProductDetailDrawer from '../components/ProductDetailDrawer';
import ProductFormDrawer from '../components/ProductFormDrawer';
import type { Product } from '../../../modules/products/types/product.types';
import type { ProductFormValues } from '../schemas/productSchema';

export default function ProductsPage() {
  const { enqueueSnackbar } = useSnackbar();

  const [search, setSearch] = useState('');
  const [availability, setAvailability] = useState<'todos' | 'disponible' | 'no_disponible'>(
    'todos',
  );
  const [categoryId, setCategoryId] = useState<string>('todas');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const filters = useMemo(
    () => ({
      limit: 100,
      search: search || undefined,
      isActive: availability === 'todos' ? undefined : availability === 'disponible',
      categoryId: categoryId === 'todas' ? undefined : categoryId,
    }),
    [search, availability, categoryId],
  );

  const { data, isLoading, isError, refetch } = useProducts(filters);
  const { data: categoriesData } = useProductCategories({ limit: 100, isActive: true });
  const categories = categoriesData?.data ?? [];
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const setProductStatus = useSetProductStatus();

  const products = data?.data ?? [];

  const handleSubmit = (values: ProductFormValues) => {
    const payload = {
      name: values.name,
      categoryId: values.categoryId || undefined,
      description: values.description || undefined,
      sku: values.sku || undefined,
      salePrice: values.salePrice,
      trackInventory: values.trackInventory,
    };

    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, payload },
        {
          onSuccess: () => {
            enqueueSnackbar('Producto actualizado correctamente', { variant: 'success' });
            setFormOpen(false);
          },
          onError: (error) => {
            enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' });
          },
        },
      );
    } else {
      createProduct.mutate(payload, {
        onSuccess: () => {
          enqueueSnackbar('Producto creado correctamente', { variant: 'success' });
          setFormOpen(false);
        },
        onError: (error) => {
          enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' });
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deletingProduct) return;
    deleteProduct.mutate(deletingProduct.id, {
      onSuccess: () => enqueueSnackbar('Producto eliminado', { variant: 'success' }),
      onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      onSettled: () => setDeletingProduct(null),
    });
  };

  const handleToggleStatus = (product: Product) => {
    setProductStatus.mutate(
      { id: product.id, isActive: !product.isActive },
      {
        onSuccess: (updated) => {
          enqueueSnackbar(updated.isActive ? 'Producto activado' : 'Producto desactivado', {
            variant: 'success',
          });
          setSelectedProduct(updated);
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  };

  return (
    <>
      <PageHeader
        title="Productos"
        subtitle="Gestiona el catálogo de productos del menú."
        breadcrumbs={[{ label: 'Productos' }]}
        actions={
          <Can permission="products.create">
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => {
                setEditingProduct(null);
                setFormOpen(true);
              }}
            >
              Nuevo producto
            </Button>
          </Can>
        }
      />

      <FilterBar
        onClear={() => {
          setSearch('');
          setAvailability('todos');
          setCategoryId('todas');
        }}
        hasActiveFilters={Boolean(search) || availability !== 'todos' || categoryId !== 'todas'}
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar producto..." />
        <TextField
          select
          size="small"
          label="Categoría"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="todas">Todas</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Estado"
          value={availability}
          onChange={(e) => setAvailability(e.target.value as typeof availability)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="todos">Todos</MenuItem>
          <MenuItem value="disponible">Activos</MenuItem>
          <MenuItem value="no_disponible">Inactivos</MenuItem>
        </TextField>
      </FilterBar>

      {isLoading ? (
        <LoadingSkeleton variant="cards" rows={8} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No hay productos con estos filtros"
          description="Ajusta la búsqueda o crea un nuevo producto para tu menú."
          actionLabel="Nuevo producto"
          onAction={() => {
            setEditingProduct(null);
            setFormOpen(true);
          }}
        />
      ) : (
        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ProductCard product={product} onClick={() => setSelectedProduct(product)} />
            </Grid>
          ))}
        </Grid>
      )}

      <ProductDetailDrawer
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onEdit={(p) => {
          setSelectedProduct(null);
          setEditingProduct(p);
          setFormOpen(true);
        }}
        onDelete={(p) => {
          setSelectedProduct(null);
          setDeletingProduct(p);
        }}
        onToggleStatus={handleToggleStatus}
      />

      <ProductFormDrawer
        open={formOpen}
        initialProduct={editingProduct}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deletingProduct)}
        title="Eliminar producto"
        description={`¿Seguro que deseas eliminar "${deletingProduct?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
