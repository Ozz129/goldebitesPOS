import { DocumentScan, DocumentScanRow } from '../domain/document-scan.interface';

export class DocumentScanMapper {
  /** storage_path is intentionally omitted — it's a server-internal file path, never exposed to clients. */
  static toDomain(row: DocumentScanRow): DocumentScan {
    return {
      id: row.id,
      businessId: row.business_id,
      category: row.category,
      title: row.title,
      documentDate: row.document_date,
      originalFileName: row.original_file_name,
      mimeType: row.mime_type,
      fileSizeBytes: parseInt(row.file_size_bytes, 10),
      uploadedBy: row.uploaded_by,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
