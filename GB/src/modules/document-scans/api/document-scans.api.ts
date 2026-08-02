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

    // apiClient sets a default 'application/json' Content-Type on the instance, which
    // takes precedence over axios's usual auto-detection of FormData — without this
    // override the request goes out as JSON with no multipart boundary and the backend
    // rejects it. Explicitly clearing it here lets the browser generate the correct
    // 'multipart/form-data; boundary=...' header itself.
    const { data } = await apiClient.post<ApiResponse<DocumentScan>>('/document-scans', formData, {
      headers: { 'Content-Type': undefined },
    });
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
