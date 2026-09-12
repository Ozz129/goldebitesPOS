-- Migration: 050_create_bank_transactions.sql
-- Created: 2026-09-10

-- Bank movements ingested from a bank-notification source (email, later maybe
-- a bank API). external_id is unique per source so the same notification can
-- never be processed twice, regardless of how many times the ingestion tick
-- or "verificar nuevamente" re-reads it.
CREATE TYPE bank_transaction_status AS ENUM ('PENDING', 'MATCHED', 'REVIEW_REQUIRED', 'IGNORED');

CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(30) NOT NULL,
  external_id VARCHAR(200) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  received_at TIMESTAMPTZ NOT NULL,
  reference VARCHAR(150),
  status bank_transaction_status NOT NULL DEFAULT 'PENDING',
  matched_order_id UUID REFERENCES orders (id),
  raw_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT bank_transactions_external_id_unique UNIQUE (source, external_id),
  CONSTRAINT bank_transactions_amount_check CHECK (amount > 0)
);

CREATE INDEX idx_bank_transactions_status ON bank_transactions (status);
CREATE INDEX idx_bank_transactions_matched_order ON bank_transactions (matched_order_id);

-- One row per "an order is waiting for a bank transfer" attempt — the
-- WAITING_PAYMENT concept the cashier sees, kept as a side table (same shape
-- as wompi_payment_intents) instead of touching the shared payment_status
-- enum that OrdersService.syncPaymentStatus() already owns.
CREATE TYPE bank_transfer_request_status AS ENUM ('WAITING', 'MATCHED', 'CANCELLED', 'EXPIRED');

CREATE TABLE bank_transfer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  order_id UUID NOT NULL REFERENCES orders (id),
  amount_expected NUMERIC(14, 2) NOT NULL,
  status bank_transfer_request_status NOT NULL DEFAULT 'WAITING',
  matched_transaction_id UUID REFERENCES bank_transactions (id),
  confirmed_by UUID REFERENCES users (id),
  created_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  CONSTRAINT bank_transfer_requests_amount_check CHECK (amount_expected > 0)
);

CREATE INDEX idx_bank_transfer_requests_order ON bank_transfer_requests (order_id);
CREATE INDEX idx_bank_transfer_requests_business_status ON bank_transfer_requests (business_id, status);

-- Only one active ("WAITING") request per order at a time.
CREATE UNIQUE INDEX idx_bank_transfer_requests_active_order
  ON bank_transfer_requests (order_id) WHERE status = 'WAITING';
