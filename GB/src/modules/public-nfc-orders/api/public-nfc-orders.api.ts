import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse } from '../../../lib/api/api-types';
import type { PublicNfcOrder, SubmitNfcOrderPayload } from '../types/public-nfc-order.types';

export const publicNfcOrdersApi = {
  async submit(token: string, payload: SubmitNfcOrderPayload): Promise<PublicNfcOrder> {
    const { data } = await apiClient.post<ApiResponse<PublicNfcOrder>>(`/public/nfc/${token}/orders`, payload);
    return data.data;
  },

  async getStatus(token: string, orderId: string): Promise<PublicNfcOrder> {
    const { data } = await apiClient.get<ApiResponse<PublicNfcOrder>>(`/public/nfc/${token}/orders/${orderId}`);
    return data.data;
  },
};
