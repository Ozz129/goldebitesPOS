-- Migration: 062_create_nfc_tags.sql
-- Created: 2026-09-20

-- A "gallo" — a physical NFC point mapped to a fixed business+branch+table.
-- Scanning it resolves a public, unguessable token to that context; the
-- customer never picks the table manually. UNIQUE(branch_id, table_number)
-- caps it at one gallo (active or not) per table at a time — reassigning one
-- just updates its branch_id/table_number, freeing up its old slot.
-- token is stored raw (not hashed): the ticket is explicit that this is not
-- an authentication credential, just an opaque lookup key that avoids
-- exposing/guessing real business/branch/table ids.
CREATE TABLE nfc_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  branch_id UUID NOT NULL REFERENCES branches (id),
  table_number VARCHAR(20) NOT NULL,
  name VARCHAR(150) NOT NULL,
  token VARCHAR(64) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_nfc_tags_token ON nfc_tags (token);
CREATE UNIQUE INDEX idx_nfc_tags_branch_table ON nfc_tags (branch_id, table_number);
CREATE INDEX idx_nfc_tags_branch ON nfc_tags (branch_id);

CREATE TRIGGER update_nfc_tags_updated_at
BEFORE UPDATE ON nfc_tags
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
