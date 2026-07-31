-- Cash register sessions and their movements (sales, income, expenses,
-- withdrawals). Only one OPEN session per branch/register is enforced at
-- the application layer.

CREATE TYPE cash_session_status AS ENUM ('OPEN', 'CLOSED');

CREATE TYPE cash_movement_type AS ENUM (
  'OPENING',
  'SALE',
  'INCOME',
  'EXPENSE',
  'WITHDRAWAL',
  'CLOSING'
);

CREATE TABLE cash_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  branch_id UUID NOT NULL REFERENCES branches (id),
  opened_by UUID NOT NULL REFERENCES users (id),
  closed_by UUID REFERENCES users (id),
  opening_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  expected_closing_amount NUMERIC(14, 2),
  actual_closing_amount NUMERIC(14, 2),
  difference_amount NUMERIC(14, 2),
  status cash_session_status NOT NULL DEFAULT 'OPEN',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  notes TEXT,
  CONSTRAINT cash_sessions_opening_amount_check CHECK (opening_amount >= 0)
);

CREATE TABLE cash_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_session_id UUID NOT NULL REFERENCES cash_sessions (id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders (id),
  movement_type cash_movement_type NOT NULL,
  payment_method payment_method,
  amount NUMERIC(14, 2) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cash_movements_amount_check CHECK (amount > 0)
);

CREATE INDEX idx_cash_sessions_business ON cash_sessions (business_id);
CREATE INDEX idx_cash_sessions_branch ON cash_sessions (branch_id);
CREATE INDEX idx_cash_sessions_status ON cash_sessions (status);

CREATE INDEX idx_cash_movements_session ON cash_movements (cash_session_id);
