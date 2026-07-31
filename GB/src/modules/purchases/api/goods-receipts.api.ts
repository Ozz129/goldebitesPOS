import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse } from '../../../lib/api/api-types';
import type { CreateGoodsReceiptPayload, GoodsReceiptWithItems } from '../types/goods-receipt.types';

export const goodsReceiptsApi = {
  async receive(payload: CreateGoodsReceiptPayload): Promise<GoodsReceiptWithItems> {
    const { data } = await apiClient.post<ApiResponse<GoodsReceiptWithItems>>(
      '/goods-receipts',
      payload,
    );
    return data.data;
  },
};
