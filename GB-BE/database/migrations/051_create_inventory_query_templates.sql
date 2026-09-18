-- Migration: 051_create_inventory_query_templates.sql
-- Created: 2026-09-18

-- Saved "Consultas especializadas" — named, reusable inventory filter combinations.
-- Shared at the business level, like other business-wide configuration (categories, etc).
CREATE TABLE inventory_query_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  name VARCHAR(150) NOT NULL,
  conditions JSONB NOT NULL,
  created_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_query_templates_business ON inventory_query_templates (business_id);
