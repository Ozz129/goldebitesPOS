-- Migration: 063_create_nfc_order_submissions.sql
-- Created: 2026-09-21

-- Idempotency ledger for the public NFC ordering endpoint (GOL-24): a client
-- generates one idempotency_key per submission attempt and resends the same
-- key on any retry/double-tap. A row claims the key before the order is
-- created/appended (order_id starts NULL); Postgres blocks a concurrent
-- INSERT of the same key until this row's transaction resolves, which is
-- what makes the claim step safe under concurrency without an explicit lock.
-- Deliberately not a column on `orders` — this is bookkeeping for the public
-- endpoint's retry-safety, not part of the order model itself.
CREATE TABLE nfc_order_submissions (
  idempotency_key UUID PRIMARY KEY,
  order_id UUID REFERENCES orders (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_nfc_order_submissions_order ON nfc_order_submissions (order_id) WHERE order_id IS NOT NULL;
