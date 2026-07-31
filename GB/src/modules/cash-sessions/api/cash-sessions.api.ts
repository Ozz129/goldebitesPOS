import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  CashMovement,
  CashSession,
  CashSessionFilters,
  CashSessionWithMovements,
  CloseCashSessionPayload,
  CreateCashMovementPayload,
  OpenCashSessionPayload,
} from '../types/cash-session.types';

export const cashSessionsApi = {
  async getSessions(filters: CashSessionFilters = {}): Promise<PaginatedResponse<CashSession>> {
    const { data } = await apiClient.get<PaginatedResponse<CashSession>>('/cash-sessions', {
      params: filters,
    });
    return data;
  },

  async getSession(id: string): Promise<CashSessionWithMovements> {
    const { data } = await apiClient.get<ApiResponse<CashSessionWithMovements>>(
      `/cash-sessions/${id}`,
    );
    return data.data;
  },

  async getCurrent(branchId: string): Promise<CashSessionWithMovements> {
    const { data } = await apiClient.get<ApiResponse<CashSessionWithMovements>>(
      '/cash-sessions/current',
      { params: { branchId } },
    );
    return data.data;
  },

  async open(payload: OpenCashSessionPayload): Promise<CashSession> {
    const { data } = await apiClient.post<ApiResponse<CashSession>>('/cash-sessions', payload);
    return data.data;
  },

  async close(id: string, payload: CloseCashSessionPayload): Promise<CashSession> {
    const { data } = await apiClient.post<ApiResponse<CashSession>>(
      `/cash-sessions/${id}/close`,
      payload,
    );
    return data.data;
  },

  async addMovement(id: string, payload: CreateCashMovementPayload): Promise<CashMovement> {
    const { data } = await apiClient.post<ApiResponse<CashMovement>>(
      `/cash-sessions/${id}/movements`,
      payload,
    );
    return data.data;
  },
};
