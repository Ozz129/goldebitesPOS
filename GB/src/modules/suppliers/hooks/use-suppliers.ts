import { useQuery } from '@tanstack/react-query';
import { suppliersApi } from '../api/suppliers.api';
import { supplierKeys } from '../api/suppliers.keys';
import type { SupplierFilters } from '../types/supplier.types';

export function useSuppliers(filters: SupplierFilters = {}) {
  return useQuery({
    queryKey: supplierKeys.list(filters),
    queryFn: () => suppliersApi.getSuppliers(filters),
    staleTime: 30_000,
  });
}
