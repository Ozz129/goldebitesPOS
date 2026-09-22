-- Migration: 066_create_branch_rules.sql
-- Created: 2026-09-22

-- RH module: a list of named rules/norms per branch (e.g. "Uniforme",
-- "Puntualidad"), shown to employees on their own profile alongside their
-- role's description (Role.description already exists, edited from the
-- Roles page). display_order supports admin reordering; the whole list for
-- a branch is replaced at once (same pattern as checklist_template_items).
CREATE TABLE branch_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  branch_id UUID NOT NULL REFERENCES branches (id),
  title VARCHAR(150) NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_branch_rules_branch ON branch_rules (branch_id, display_order);

CREATE TRIGGER update_branch_rules_updated_at
BEFORE UPDATE ON branch_rules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
