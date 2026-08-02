-- Document/receipt scan registry (invoices, receipts, other). Unlike
-- compliance_documents, this stores a real uploaded file: storage_path
-- points at where the binary lives on disk (see the document-scans module).

CREATE TABLE document_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  category VARCHAR(30) NOT NULL,
  title VARCHAR(150) NOT NULL,
  document_date DATE,
  original_file_name VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  uploaded_by UUID REFERENCES users (id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_document_scans_business ON document_scans (business_id);

CREATE TRIGGER update_document_scans_updated_at
BEFORE UPDATE ON document_scans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
