-- Migration: 055_create_reimbursement_obligations.sql
-- Created: 2026-09-18

-- One obligation per PERSONAL_MONEY expense (1:1 — enforced by the UNIQUE on
-- expense_id). reimbursed/pending amounts are never stored here: they're
-- always computed as SUM(reimbursement_payments.amount), same principle
-- this codebase already uses for inventory stock (computed from movements,
-- never a maintained column). Only `status` is a real column, since voiding
-- is a manual decision independent of the amounts.
CREATE TABLE reimbursement_obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  expense_id UUID NOT NULL UNIQUE REFERENCES expenses (id),
  payer_employee_id UUID REFERENCES employees (id),
  payer_name VARCHAR(150) NOT NULL,
  original_amount NUMERIC(12, 2) NOT NULL CHECK (original_amount > 0),
  status VARCHAR(25) NOT NULL DEFAULT 'PENDING',
  voided_at TIMESTAMPTZ,
  voided_by UUID REFERENCES users (id),
  void_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reimbursement_obligations_status_check
    CHECK (status IN ('PENDING', 'PARTIALLY_REIMBURSED', 'REIMBURSED', 'VOIDED'))
);

CREATE INDEX idx_reimbursement_obligations_business ON reimbursement_obligations (business_id);
CREATE INDEX idx_reimbursement_obligations_payer_employee ON reimbursement_obligations (payer_employee_id);

CREATE TRIGGER update_reimbursement_obligations_updated_at
BEFORE UPDATE ON reimbursement_obligations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Append-only ledger of partial/full payouts against an obligation. Always
-- branch-scoped (a physical cash drawer is always in one branch), even
-- though the obligation itself is business-scoped.
CREATE TABLE reimbursement_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obligation_id UUID NOT NULL REFERENCES reimbursement_obligations (id),
  branch_id UUID NOT NULL REFERENCES branches (id),
  cash_movement_id UUID REFERENCES cash_movements (id),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  notes TEXT,
  created_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reimbursement_payments_obligation ON reimbursement_payments (obligation_id);
