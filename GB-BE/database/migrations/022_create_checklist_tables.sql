-- Checklist templates (opening/closing routines) and their runs.

CREATE TABLE checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  type VARCHAR(20) NOT NULL,
  name VARCHAR(150) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT checklist_templates_type_check CHECK (type IN ('OPENING', 'CLOSING'))
);

CREATE INDEX idx_checklist_templates_business ON checklist_templates (business_id);

CREATE TABLE checklist_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES checklist_templates (id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_checklist_template_items_template ON checklist_template_items (template_id);

-- A run snapshots the template's items at start time (label_snapshot), so
-- editing a template later never rewrites the history of past runs.
CREATE TABLE checklist_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  branch_id UUID NOT NULL REFERENCES branches (id),
  template_id UUID NOT NULL REFERENCES checklist_templates (id),
  status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
  started_by UUID REFERENCES users (id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  observations TEXT,
  CONSTRAINT checklist_runs_status_check CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'INCOMPLETE'))
);

CREATE INDEX idx_checklist_runs_business ON checklist_runs (business_id);
CREATE INDEX idx_checklist_runs_template ON checklist_runs (template_id);

CREATE TABLE checklist_run_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES checklist_runs (id) ON DELETE CASCADE,
  template_item_id UUID REFERENCES checklist_template_items (id) ON DELETE SET NULL,
  label_snapshot VARCHAR(255) NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_checklist_run_items_run ON checklist_run_items (run_id);

CREATE TRIGGER update_checklist_templates_updated_at
BEFORE UPDATE ON checklist_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
