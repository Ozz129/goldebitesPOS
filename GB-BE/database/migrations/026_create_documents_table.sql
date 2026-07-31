-- Compliance document registry (legal, sanitary, safety, etc.). Metadata
-- only: `file_name` is a free-text label entered by staff — this backend
-- has no file storage/upload, so no binary is ever stored or served.

CREATE TABLE compliance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  issue_date DATE NOT NULL,
  expiration_date DATE,
  responsible VARCHAR(150),
  file_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_compliance_documents_business ON compliance_documents (business_id);

CREATE TRIGGER update_compliance_documents_updated_at
BEFORE UPDATE ON compliance_documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
