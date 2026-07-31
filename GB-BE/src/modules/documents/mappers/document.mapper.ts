import {
  ComplianceDocument,
  ComplianceDocumentRow,
} from '../domain/document.interface';

export class DocumentMapper {
  static toDomain(row: ComplianceDocumentRow): ComplianceDocument {
    return {
      id: row.id,
      businessId: row.business_id,
      name: row.name,
      category: row.category,
      issueDate: row.issue_date,
      expirationDate: row.expiration_date,
      responsible: row.responsible,
      fileName: row.file_name,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
