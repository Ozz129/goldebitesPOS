-- Tracks a Wompi checkout attempt from creation to resolution, so we can verify the amount/order
-- Wompi confirms matches what we asked for, and avoid double-creating a payment if confirmation
-- is retried (e.g. once via redirect, later via webhook).
CREATE TABLE wompi_payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  order_id UUID NOT NULL REFERENCES orders (id),
  reference VARCHAR(100) NOT NULL UNIQUE,
  amount_in_cents BIGINT NOT NULL,
  payer_label VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  wompi_transaction_id VARCHAR(100),
  payment_id UUID REFERENCES payments (id),
  created_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT wompi_intents_status_check CHECK (status IN ('PENDING','APPROVED','DECLINED','ERROR','VOIDED'))
);

CREATE INDEX idx_wompi_intents_order ON wompi_payment_intents (order_id);
