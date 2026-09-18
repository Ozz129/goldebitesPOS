-- Migration: 053_create_platform_feature_flags.sql
-- Created: 2026-09-18

-- Platform-wide feature flags: unlike business_features (per-tenant), these
-- apply to every business at once — development/release kill switches
-- ("still being tested, turn it off everywhere"), independent of what any
-- individual business has enabled for itself. Sparse storage: absence of a
-- row means enabled, same convention as business_features.
CREATE TABLE platform_feature_flags (
  feature_key VARCHAR(50) PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_platform_feature_flags_updated_at
BEFORE UPDATE ON platform_feature_flags
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
