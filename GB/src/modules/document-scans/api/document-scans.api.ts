import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  CreateDocumentScanPayload,
  DocumentScan,
  DocumentScanFilters,
  UpdateDocumentScanPayload,
} from '../types/document-scan.types';

export const documentScansApi = {
  async getDocumentScans(filters: DocumentScanFilters = {}): Promise<PaginatedResponse<DocumentScan>> {
    const { data } = await apiClient.get<PaginatedResponse<DocumentScan>>('/document-scans', {
      params: filters,
    });
    return data;
  },

  async createDocumentScan(payload: CreateDocumentScanPayload): Promise<DocumentScan> {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('title', payload.title);
    formData.append('category', payload.category);
    if (payload.documentDate) formData.append('documentDate', payload.documentDate);
    if (payload.notes) formData.append('notes', payload.notes);

    // axios detects FormData and sets the multipart Content-Type + boundary itself.
    const { data } = await apiClient.post<ApiResponse<DocumentScan>>('/document-scans', formData);
    return data.data;
  },

  async updateDocumentScan(id: string, payload: UpdateDocumentScanPayload): Promise<DocumentScan> {
    const { data } = await apiClient.patch<ApiResponse<DocumentScan>>(`/document-scans/${id}`, payload);
    return data.data;
  },

  async deleteDocumentScan(id: string): Promise<void> {
    await apiClient.delete(`/document-scans/${id}`);
  },

  async getFileBlob(id: string): Promise<Blob> {
    const { data } = await apiClient.get<Blob>(`/document-scans/${id}/file`, {
      responseType: 'blob',
    });
    return data;
  },
};
