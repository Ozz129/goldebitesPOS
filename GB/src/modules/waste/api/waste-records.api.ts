import { apiClient } from '../../../lib/api/api-client';
import type { PaginatedResponse, ApiResponse } from '../../../lib/api/api-types';
import type {
  CreateWasteRecordPayload,
  WasteRecord,
  WasteRecordFilters,
} from '../types/waste-record.types';

export const wasteRecordsApi = {
  async getRecords(filters: WasteRecordFilters = {}): Promise<PaginatedResponse<WasteRecord>> {
    const { data } = await apiClient.get<PaginatedResponse<WasteRecord>>('/waste', {
      params: filters,
    });
    return data;
  },

  async createRecord(payload: CreateWasteRecordPayload): Promise<WasteRecord> {
    const { data } = await apiClient.post<ApiResponse<WasteRecord>>('/waste', payload);
    return data.data;
  },
};
