-- Daily-reset order numbers: format is MMDD-NN (month/day + a sequence that
-- resets every business-local calendar day), replacing the old global
-- sequential BIGINT. The counter is shared across all branches of a
-- business (not per-branch), matching how order_number_sequence was already
-- business-wide before this change.

CREATE TABLE daily_order_counters (
  business_id UUID NOT NULL REFERENCES businesses (id),
  order_date DATE NOT NULL,
  last_number INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (business_id, order_date)
);

ALTER TABLE orders ALTER COLUMN order_number DROP DEFAULT;
ALTER TABLE orders ALTER COLUMN order_number TYPE VARCHAR(16) USING order_number::text;
