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
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentPayload {
  name: string;
  category: string;
  issueDate: string;
  expirationDate?: string;
  responsible?: string;
  fileName?: string;
  notes?: string;
}

export type UpdateDocumentPayload = Partial<CreateDocumentPayload>;

export interface DocumentFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}
