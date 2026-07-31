export interface CreateComplianceDocumentData {
  businessId: string;
  name: string;
  category: string;
  issueDate: string;
  expirationDate?: string;
  responsible?: string;
  fileName?: string;
  notes?: string;
}

export interface UpdateComplianceDocumentData {
  name?: string;
  category?: string;
  issueDate?: string;
  expirationDate?: string;
  responsible?: string;
  fileName?: string;
  notes?: string;
}

export interface ComplianceDocumentQuery {
  businessId: string;
  page: number;
  limit: number;
  category?: string;
  search?: string;
}
