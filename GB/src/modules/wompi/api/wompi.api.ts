import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse } from '../../../lib/api/api-types';
import type {
  ConfirmWompiTransactionPayload,
  CreateWompiIntentPayload,
  WompiCheckoutParams,
  WompiConfirmResult,
  WompiQrCheckout,
} from '../types/wompi.types';

export const wompiApi = {
  async createIntent(orderId: string, payload: CreateWompiIntentPayload = {}): Promise<WompiCheckoutParams> {
    const { data } = await apiClient.post<ApiResponse<WompiCheckoutParams>>(
      `/orders/${orderId}/wompi-payments`,
      payload,
    );
    return data.data;
  },

  async createQrCheckout(orderId: string, payload: CreateWompiIntentPayload = {}): Promise<WompiQrCheckout> {
    const { data } = await apiClient.post<ApiResponse<WompiQrCheckout>>(
      `/orders/${orderId}/wompi-payments/qr`,
      payload,
    );
    return data.data;
  },

  async confirmTransaction(
    orderId: string,
    reference: string,
    payload: ConfirmWompiTransactionPayload,
  ): Promise<WompiConfirmResult> {
    const { data } = await apiClient.post<ApiResponse<WompiConfirmResult>>(
      `/orders/${orderId}/wompi-payments/${reference}/confirm`,
      payload,
    );
    return data.data;
  },
};
