export type DocumentScanCategory = 'invoice' | 'receipt' | 'other';

export interface DocumentScan {
  id: string;
  businessId: string;
  category: DocumentScanCategory;
  title: string;
  documentDate: string | null;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentScanPayload {
  title: string;
  category: DocumentScanCategory;
  documentDate?: string;
  notes?: string;
  file: File;
}

export interface UpdateDocumentScanPayload {
  title?: string;
  category?: DocumentScanCategory;
  documentDate?: string;
  notes?: string;
}

export interface DocumentScanFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}
