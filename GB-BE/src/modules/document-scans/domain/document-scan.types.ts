export interface CreateDocumentScanData {
  businessId: string;
  category: string;
  title: string;
  documentDate?: string;
  originalFileName: string;
  storagePath: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedBy?: string;
  notes?: string;
}

export interface UpdateDocumentScanData {
  category?: string;
  title?: string;
  documentDate?: string;
  notes?: string;
}

export interface DocumentScanQuery {
  businessId: string;
  page: number;
  limit: number;
  category?: string;
  search?: string;
}
