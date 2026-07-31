import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  CreateEquipmentPayload,
  CreateInterventionPayload,
  Equipment,
  EquipmentFilters,
  EquipmentStatus,
  EquipmentWithInterventions,
  UpdateEquipmentPayload,
} from '../types/maintenance.types';

export const maintenanceApi = {
  async getEquipment(filters: EquipmentFilters = {}): Promise<PaginatedResponse<Equipment>> {
    const { data } = await apiClient.get<PaginatedResponse<Equipment>>('/equipment', {
      params: filters,
    });
    return data;
  },

  async getEquipmentDetail(id: string): Promise<EquipmentWithInterventions> {
    const { data } = await apiClient.get<ApiResponse<EquipmentWithInterventions>>(`/equipment/${id}`);
    return data.data;
  },

  async createEquipment(payload: CreateEquipmentPayload): Promise<Equipment> {
    const { data } = await apiClient.post<ApiResponse<Equipment>>('/equipment', payload);
    return data.data;
  },

  async updateEquipment(id: string, payload: UpdateEquipmentPayload): Promise<Equipment> {
    const { data } = await apiClient.patch<ApiResponse<Equipment>>(`/equipment/${id}`, payload);
    return data.data;
  },

  async setEquipmentStatus(id: string, status: EquipmentStatus): Promise<Equipment> {
    const { data } = await apiClient.patch<ApiResponse<Equipment>>(`/equipment/${id}/status`, {
      status,
    });
    return data.data;
  },

  async deleteEquipment(id: string): Promise<void> {
    await apiClient.delete(`/equipment/${id}`);
  },

  async addIntervention(
    id: string,
    payload: CreateInterventionPayload,
  ): Promise<EquipmentWithInterventions> {
    const { data } = await apiClient.post<ApiResponse<EquipmentWithInterventions>>(
      `/equipment/${id}/interventions`,
      payload,
    );
    return data.data;
  },

  async removeIntervention(id: string, interventionId: string): Promise<void> {
    await apiClient.delete(`/equipment/${id}/interventions/${interventionId}`);
  },
};
