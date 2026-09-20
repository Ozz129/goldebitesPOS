-- Migration: 059_evolve_expense_payment_source.sql
-- Created: 2026-09-19

-- VARCHAR(20) was enough for 'BUSINESS_FUNDS'/'PERSONAL_MONEY' but not for
-- 'UNSPECIFIED_HISTORICAL' (22 chars) or 'CASH_OPERATIONAL' (17, fits, kept
-- here for headroom).
ALTER TABLE expenses ALTER COLUMN payment_source TYPE VARCHAR(30);

-- Constraint has to widen to the 5-value model before the data migration
-- below can write 'UNSPECIFIED_HISTORICAL' — added NOT VALID because
-- existing 'BUSINESS_FUNDS' rows (not yet migrated) would otherwise fail
-- validation immediately; VALIDATE CONSTRAINT below re-checks once the data
-- migration has cleaned them up.
ALTER TABLE expenses DROP CONSTRAINT expenses_payment_source_check;
ALTER TABLE expenses ADD CONSTRAINT expenses_payment_source_check
  CHECK (payment_source IN ('CASH_OPERATIONAL', 'CASH_RESERVE', 'BANK_ACCOUNT', 'PERSONAL_MONEY', 'UNSPECIFIED_HISTORICAL'))
  NOT VALID;

-- BUSINESS_FUNDS no longer distinguishes between Golden Bites' three own
-- funds (Caja operativa, Reserva, Cuenta bancaria) — existing rows become
-- the historical marker BR-07 requires, since we can't retroactively know
-- which of the three was actually used.
UPDATE expenses SET payment_source = 'UNSPECIFIED_HISTORICAL' WHERE payment_source = 'BUSINESS_FUNDS';

ALTER TABLE expenses VALIDATE CONSTRAINT expenses_payment_source_check;

-- No more silent default — a source is now mandatory at the app layer
-- (AC-01), so nothing should ever fall back to one automatically.
ALTER TABLE expenses ALTER COLUMN payment_source DROP DEFAULT;

-- Mutable pointer to this expense's current effect in the ledger — not the
-- ledger itself (cash_movements/fund_movements stay insert-only). Updated on
-- every create/reclassification so a future reclassification knows what to
-- reverse. Exactly one of the three is set at a time, depending on the
-- current payment_source (NULL/NULL/NULL for PERSONAL_MONEY and
-- UNSPECIFIED_HISTORICAL, which have no fund/cash-session effect).
ALTER TABLE expenses
  ADD COLUMN cash_session_id UUID REFERENCES cash_sessions (id),
  ADD COLUMN cash_movement_id UUID REFERENCES cash_movements (id),
  ADD COLUMN fund_movement_id UUID REFERENCES fund_movements (id);
