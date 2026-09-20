-- Migration: 061_relax_reimbursement_obligation_expense_uniqueness.sql
-- Created: 2026-09-19

-- A gasto can round-trip through PERSONAL_MONEY more than once across its
-- reclassification history (source reclassified away from Personal voids the
-- obligation — BR-08 — without deleting it; reclassified back into Personal
-- later must be able to create a fresh one). The old hard UNIQUE on
-- expense_id would reject that second obligation forever, even though the
-- first is VOIDED. Relaxed to: at most one *active* (non-voided) obligation
-- per expense at a time — voided history stays queryable.
ALTER TABLE reimbursement_obligations DROP CONSTRAINT reimbursement_obligations_expense_id_key;

CREATE UNIQUE INDEX idx_reimbursement_obligations_active_per_expense
  ON reimbursement_obligations (expense_id)
  WHERE status != 'VOIDED';
