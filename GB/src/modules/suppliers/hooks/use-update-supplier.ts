import { useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersApi } from '../api/suppliers.api';
import { supplierKeys } from '../api/suppliers.keys';
import type { UpdateSupplierPayload } from '../types/supplier.types';

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSupplierPayload }) =>
      suppliersApi.updateSupplier(id, payload),
    onSuccess: (supplier) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(supplier.id) });
    },
  });
}
