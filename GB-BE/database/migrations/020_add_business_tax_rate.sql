-- Business-level sales tax rate, expressed as a fraction (0.19 = 19%).
-- Consumed by Purchases (Phase 4) and Orders (Phase 5), both of which
-- previously hard-coded 0 while this setting did not exist yet.

ALTER TABLE businesses
  ADD COLUMN tax_rate NUMERIC(5, 4) NOT NULL DEFAULT 0;

ALTER TABLE businesses
  ADD CONSTRAINT businesses_tax_rate_check CHECK (tax_rate >= 0 AND tax_rate <= 1);
