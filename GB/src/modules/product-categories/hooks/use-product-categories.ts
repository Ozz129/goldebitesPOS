import { useQuery } from '@tanstack/react-query';
import { productCategoriesApi } from '../api/product-categories.api';
import { productCategoryKeys } from '../api/product-categories.keys';
import type { ProductCategoryFilters } from '../types/product-category.types';

export function useProductCategories(filters: ProductCategoryFilters = {}) {
  return useQuery({
    queryKey: productCategoryKeys.list(filters),
    queryFn: () => productCategoriesApi.getCategories(filters),
    staleTime: 60_000,
  });
}
