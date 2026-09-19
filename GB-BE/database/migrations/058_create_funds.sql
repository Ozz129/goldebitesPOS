-- Migration: 058_create_funds.sql
-- Created: 2026-09-19

-- Base financial infrastructure (GOL-12): represents Reserva de efectivo,
-- Fondo para próxima apertura, and Cuenta bancaria as real funds with a
-- balance. Caja operativa is NOT duplicated here — it stays exactly as it
-- is today (cash_sessions/cash_movements).
--
-- One fund per (business, branch, type). BANK_ACCOUNT is always
-- business-level (branch_id NULL) — there is only one Golden Bites bank
-- account. CASH_RESERVE/NEXT_OPENING_FUND carry branch_id when the business
-- has active branches, NULL when it doesn't (same "active branch count",
-- not "branch row existence", criterion already used elsewhere in this app).
CREATE TABLE funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  branch_id UUID REFERENCES branches (id),
  fund_type VARCHAR(30) NOT NULL,
  initialized_at TIMESTAMPTZ,
  initialized_by UUID REFERENCES users (id),
  initialization_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT funds_fund_type_check CHECK (fund_type IN ('CASH_RESERVE', 'NEXT_OPENING_FUND', 'BANK_ACCOUNT')),
  -- NULLS NOT DISTINCT: without it, Postgres treats every NULL branch_id as
  -- distinct from every other, so this constraint would never catch two
  -- business-level funds (BANK_ACCOUNT, or a branchless business's reserve)
  -- of the same type — defeating the one-fund-per-location guarantee.
  CONSTRAINT funds_unique_per_location UNIQUE NULLS NOT DISTINCT (business_id, branch_id, fund_type)
);

CREATE INDEX idx_funds_business ON funds (business_id);

CREATE TRIGGER update_funds_updated_at
BEFORE UPDATE ON funds
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Append-only ledger — never updated, never deleted. balance_before/
-- balance_after are recorded on every row, so "current balance" is simply
-- the balance_after of a fund's most recent movement (never a stored,
-- mutable balance column — same principle already used for inventory stock
-- and reimbursement-obligation balances in this codebase).
CREATE TABLE fund_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID NOT NULL REFERENCES funds (id),
  direction VARCHAR(10) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  balance_before NUMERIC(14, 2) NOT NULL,
  balance_after NUMERIC(14, 2) NOT NULL CHECK (balance_after >= 0),
  source_type VARCHAR(50) NOT NULL,
  source_id UUID,
  notes TEXT,
  created_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fund_movements_direction_check CHECK (direction IN ('CREDIT', 'DEBIT'))
);

CREATE INDEX idx_fund_movements_fund_created ON fund_movements (fund_id, created_at DESC);

-- The same source operation can never affect the same fund twice (BR-06/AC-09).
-- Partial (source_id IS NOT NULL only) because a manual initialization has no
-- "origin entity" — its own one-time-ness is guarded by funds.initialized_at.
CREATE UNIQUE INDEX idx_fund_movements_idempotency
  ON fund_movements (fund_id, source_type, source_id)
  WHERE source_id IS NOT NULL;
