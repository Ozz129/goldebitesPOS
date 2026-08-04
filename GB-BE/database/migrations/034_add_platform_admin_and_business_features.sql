-- Platform-level administration: a user flagged is_platform_admin can manage
-- businesses across tenants (see the new platform-admin module). Absence of
-- a business_features row means "enabled" — existing businesses keep every
-- module on by default, no backfill needed.

ALTER TABLE users ADD COLUMN is_platform_admin BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE business_features (
  business_id UUID NOT NULL REFERENCES businesses (id),
  feature_key VARCHAR(50) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (business_id, feature_key)
);

CREATE TRIGGER update_business_features_updated_at
BEFORE UPDATE ON business_features
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
