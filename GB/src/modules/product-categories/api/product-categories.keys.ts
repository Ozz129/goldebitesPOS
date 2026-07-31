import type { ProductCategoryFilters } from '../types/product-category.types';

export const productCategoryKeys = {
  all: ['product-categories'] as const,
  lists: () => [...productCategoryKeys.all, 'list'] as const,
  list: (filters: ProductCategoryFilters) => [...productCategoryKeys.lists(), filters] as const,
  details: () => [...productCategoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...productCategoryKeys.details(), id] as const,
};
