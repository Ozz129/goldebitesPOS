import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goodsReceiptsApi } from '../api/goods-receipts.api';
import { purchaseOrderKeys } from '../api/purchase-orders.keys';
import { inventoryKeys } from '../../inventory/api/inventory.keys';
import type { CreateGoodsReceiptPayload } from '../types/goods-receipt.types';

export function useReceiveGoods() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGoodsReceiptPayload) => goodsReceiptsApi.receive(payload),
    onSuccess: (receipt) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(receipt.purchaseOrderId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}
