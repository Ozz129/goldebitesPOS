import { useSnackbar } from 'notistack';
import { useProductCategories } from '../../../modules/product-categories/hooks/use-product-categories';
import { useCreateProductCategory } from '../../../modules/product-categories/hooks/use-create-product-category';
import { useUpdateProductCategory } from '../../../modules/product-categories/hooks/use-update-product-category';
import { useSetProductCategoryStatus } from '../../../modules/product-categories/hooks/use-set-product-category-status';
import { normalizeApiError } from '../../../lib/api/api-error';
import SimpleCatalogManager from './SimpleCatalogManager';

export default function ProductCategoriesTab() {
  const { enqueueSnackbar } = useSnackbar();
  const { data, isLoading, isError, refetch } = useProductCategories({ limit: 100 });
  const createCategory = useCreateProductCategory();
  const updateCategory = useUpdateProductCategory();
  const setCategoryStatus = useSetProductCategoryStatus();

  return (
    <SimpleCatalogManager
      entityLabel="categoría"
      entityLabelPlural="categorías"
      gender="f"
      items={data?.data ?? []}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
      creating={createCategory.isPending}
      updating={updateCategory.isPending}
      onCreate={(values, onSuccess) =>
        createCategory.mutate(values, {
          onSuccess,
          onError: (error) =>
            enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
        })
      }
      onUpdate={(id, values, onSuccess) =>
        updateCategory.mutate(
          { id, payload: values },
          {
            onSuccess,
            onError: (error) =>
              enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
          },
        )
      }
      onToggleStatus={(category) =>
        setCategoryStatus.mutate(
          { id: category.id, isActive: !category.isActive },
          {
            onSuccess: (updated) =>
              enqueueSnackbar(updated.isActive ? 'Categoría activada' : 'Categoría desactivada', {
                variant: 'success',
              }),
            onError: (error) =>
              enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
          },
        )
      }
    />
  );
}
