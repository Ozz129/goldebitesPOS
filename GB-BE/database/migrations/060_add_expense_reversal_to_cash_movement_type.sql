-- Migration: 060_add_expense_reversal_to_cash_movement_type.sql
-- Created: 2026-09-19

-- Reverses a previous EXPENSE movement when a source reclassification moves
-- an expense away from Caja operativa — inserted, never mutates the original
-- EXPENSE row (insert-only ledger). Own migration file: ALTER TYPE ... ADD
-- VALUE can't share a transaction with DDL/DML that uses the new value, same
-- reason 056_add_reimbursement_to_cash_movement_type.sql is standalone too.
-- Deliberately not added to create-cash-movement.dto.ts's MANUAL_MOVEMENT_TYPES
-- — only the reclassification flow ever produces this movement type.
ALTER TYPE cash_movement_type ADD VALUE 'EXPENSE_REVERSAL';
