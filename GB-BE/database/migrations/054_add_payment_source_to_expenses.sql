-- Migration: 054_add_payment_source_to_expenses.sql
-- Created: 2026-09-18

-- Distinguishes expenses paid with Golden Bites' own funds (today's only
-- behavior) from expenses paid with an employee's or partner's personal
-- money — the latter still belongs to Golden Bites but creates a pending
-- reimbursement obligation instead of touching cash immediately.
ALTER TABLE expenses
  ADD COLUMN payment_source VARCHAR(20) NOT NULL DEFAULT 'BUSINESS_FUNDS',
  ADD COLUMN payer_employee_id UUID REFERENCES employees (id),
  ADD COLUMN payer_name VARCHAR(150);

ALTER TABLE expenses
  ADD CONSTRAINT expenses_payment_source_check
  CHECK (payment_source IN ('BUSINESS_FUNDS', 'PERSONAL_MONEY'));

ALTER TABLE expenses
  ADD CONSTRAINT expenses_personal_money_requires_payer
  CHECK (payment_source != 'PERSONAL_MONEY' OR payer_name IS NOT NULL);
