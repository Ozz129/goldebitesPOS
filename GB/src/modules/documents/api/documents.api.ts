import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  ComplianceDocument,
  CreateDocumentPayload,
  DocumentFilters,
  UpdateDocumentPayload,
} from '../types/document.types';

export const documentsApi = {
  async getDocuments(filters: DocumentFilters = {}): Promise<PaginatedResponse<ComplianceDocument>> {
    const { data } = await apiClient.get<PaginatedResponse<ComplianceDocument>>('/compliance-documents', {
      params: filters,
    });
    return data;
  },

  async createDocument(payload: CreateDocumentPayload): Promise<ComplianceDocument> {
    const { data } = await apiClient.post<ApiResponse<ComplianceDocument>>('/compliance-documents', payload);
    return data.data;
  },

  async updateDocument(id: string, payload: UpdateDocumentPayload): Promise<ComplianceDocument> {
    const { data } = await apiClient.patch<ApiResponse<ComplianceDocument>>(`/compliance-documents/${id}`, payload);
    return data.data;
  },

  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/compliance-documents/${id}`);
  },
};
