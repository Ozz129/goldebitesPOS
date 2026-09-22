-- Migration: 065_create_table_names.sql
-- Created: 2026-09-22

-- A friendly display name for a physical table (e.g. "Terraza" instead of
-- "Mesa 5"), independent of NFC — nfc_tags.name already exists but is bound
-- to generating a full token/link, so it's not a lightweight way to just
-- name a table. orders.table_number has no FK to anything, so this is a
-- pure (branch_id, table_number) -> name lookup layered on top; no existing
-- data model changes.
CREATE TABLE table_names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  branch_id UUID NOT NULL REFERENCES branches (id),
  table_number VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_table_names_branch_table ON table_names (branch_id, table_number);
CREATE INDEX idx_table_names_branch ON table_names (business_id, branch_id);

CREATE TRIGGER update_table_names_updated_at
BEFORE UPDATE ON table_names
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
