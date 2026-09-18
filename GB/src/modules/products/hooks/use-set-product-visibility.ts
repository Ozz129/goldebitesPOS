import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { productKeys } from '../api/products.keys';

export function useSetProductVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      productsApi.setProductVisibility(id, isVisible),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(product.id) });
    },
  });
}
