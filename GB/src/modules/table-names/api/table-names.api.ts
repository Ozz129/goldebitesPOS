import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse } from '../../../lib/api/api-types';
import type { TableName, UpsertTableNamePayload } from '../types/table-name.types';

export const tableNamesApi = {
  async getByBranch(branchId: string): Promise<TableName[]> {
    const { data } = await apiClient.get<ApiResponse<TableName[]>>('/table-names', { params: { branchId } });
    return data.data;
  },

  async upsert(payload: UpsertTableNamePayload): Promise<TableName> {
    const { data } = await apiClient.put<ApiResponse<TableName>>('/table-names', payload);
    return data.data;
  },

  async clear(branchId: string, tableNumber: string): Promise<void> {
    await apiClient.delete('/table-names', { params: { branchId, tableNumber } });
  },
};
