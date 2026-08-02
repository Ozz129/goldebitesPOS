export interface DocumentScan {
  id: string;
  businessId: string;
  category: string;
  title: string;
  documentDate: string | null;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedBy: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentScanRow {
  id: string;
  business_id: string;
  category: string;
  title: string;
  document_date: string | null;
  original_file_name: string;
  storage_path: string;
  mime_type: string;
  file_size_bytes: string;
  uploaded_by: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
