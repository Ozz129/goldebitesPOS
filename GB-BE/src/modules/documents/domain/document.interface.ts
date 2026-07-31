export interface ComplianceDocument {
  id: string;
  businessId: string;
  name: string;
  category: string;
  issueDate: string;
  expirationDate: string | null;
  responsible: string | null;
  fileName: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceDocumentRow {
  id: string;
  business_id: string;
  name: string;
  category: string;
  issue_date: string;
  expiration_date: string | null;
  responsible: string | null;
  file_name: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
