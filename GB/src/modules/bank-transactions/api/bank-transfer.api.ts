import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse } from '../../../lib/api/api-types';
import type { BankTransferStatusView } from '../types/bank-transfer.types';

export const bankTransferApi = {
  async start(orderId: string): Promise<BankTransferStatusView> {
    const { data } = await apiClient.post<ApiResponse<BankTransferStatusView>>(
      `/orders/${orderId}/bank-transfer/start`,
    );
    return data.data;
  },

  async getStatus(orderId: string): Promise<BankTransferStatusView> {
    const { data } = await apiClient.get<ApiResponse<BankTransferStatusView>>(
      `/orders/${orderId}/bank-transfer/status`,
    );
    return data.data;
  },

  async recheck(orderId: string): Promise<BankTransferStatusView> {
    const { data } = await apiClient.post<ApiResponse<BankTransferStatusView>>(
      `/orders/${orderId}/bank-transfer/recheck`,
    );
    return data.data;
  },

  async cancel(orderId: string): Promise<BankTransferStatusView> {
    const { data } = await apiClient.post<ApiResponse<BankTransferStatusView>>(
      `/orders/${orderId}/bank-transfer/cancel`,
    );
    return data.data;
  },

  async confirmManual(orderId: string, transactionId: string): Promise<BankTransferStatusView> {
    const { data } = await apiClient.post<ApiResponse<BankTransferStatusView>>(
      `/orders/${orderId}/bank-transfer/confirm-manual`,
      { transactionId },
    );
    return data.data;
  },
};
