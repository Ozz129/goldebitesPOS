import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { productKeys } from '../api/products.keys';
import type { ProductFilters } from '../types/product.types';

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productsApi.getProducts(filters),
    staleTime: 30_000,
  });
}
