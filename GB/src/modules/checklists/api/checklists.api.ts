import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  ChecklistRun,
  ChecklistRunFilters,
  ChecklistRunWithItems,
  ChecklistTemplate,
  ChecklistTemplateFilters,
  ChecklistTemplateWithItems,
  CreateChecklistTemplatePayload,
  ItemResultInput,
  StartChecklistRunPayload,
  TemplateItemInput,
  UpdateChecklistTemplatePayload,
} from '../types/checklist.types';

export const checklistTemplatesApi = {
  async getTemplates(filters: ChecklistTemplateFilters = {}): Promise<PaginatedResponse<ChecklistTemplate>> {
    const { data } = await apiClient.get<PaginatedResponse<ChecklistTemplate>>('/checklist-templates', {
      params: filters,
    });
    return data;
  },

  async getTemplate(id: string): Promise<ChecklistTemplateWithItems> {
    const { data } = await apiClient.get<ApiResponse<ChecklistTemplateWithItems>>(`/checklist-templates/${id}`);
    return data.data;
  },

  async createTemplate(payload: CreateChecklistTemplatePayload): Promise<ChecklistTemplateWithItems> {
    const { data } = await apiClient.post<ApiResponse<ChecklistTemplateWithItems>>('/checklist-templates', payload);
    return data.data;
  },

  async updateTemplate(id: string, payload: UpdateChecklistTemplatePayload): Promise<ChecklistTemplate> {
    const { data } = await apiClient.patch<ApiResponse<ChecklistTemplate>>(`/checklist-templates/${id}`, payload);
    return data.data;
  },

  async replaceItems(id: string, items: TemplateItemInput[]): Promise<ChecklistTemplateWithItems> {
    const { data } = await apiClient.put<ApiResponse<ChecklistTemplateWithItems>>(
      `/checklist-templates/${id}/items`,
      { items },
    );
    return data.data;
  },

  async setTemplateStatus(id: string, isActive: boolean): Promise<ChecklistTemplate> {
    const { data } = await apiClient.patch<ApiResponse<ChecklistTemplate>>(`/checklist-templates/${id}/status`, {
      isActive,
    });
    return data.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`/checklist-templates/${id}`);
  },
};

export const checklistRunsApi = {
  async getRuns(filters: ChecklistRunFilters = {}): Promise<PaginatedResponse<ChecklistRun>> {
    const { data } = await apiClient.get<PaginatedResponse<ChecklistRun>>('/checklist-runs', {
      params: filters,
    });
    return data;
  },

  async getRun(id: string): Promise<ChecklistRunWithItems> {
    const { data } = await apiClient.get<ApiResponse<ChecklistRunWithItems>>(`/checklist-runs/${id}`);
    return data.data;
  },

  async startRun(payload: StartChecklistRunPayload): Promise<ChecklistRunWithItems> {
    const { data } = await apiClient.post<ApiResponse<ChecklistRunWithItems>>('/checklist-runs', payload);
    return data.data;
  },

  async updateItems(id: string, items: ItemResultInput[]): Promise<ChecklistRunWithItems> {
    const { data } = await apiClient.put<ApiResponse<ChecklistRunWithItems>>(`/checklist-runs/${id}/items`, {
      items,
    });
    return data.data;
  },

  async completeRun(id: string, observations?: string): Promise<ChecklistRunWithItems> {
    const { data } = await apiClient.post<ApiResponse<ChecklistRunWithItems>>(`/checklist-runs/${id}/complete`, {
      observations,
    });
    return data.data;
  },
};
