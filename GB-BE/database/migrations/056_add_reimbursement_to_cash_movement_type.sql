-- Migration: 056_add_reimbursement_to_cash_movement_type.sql
-- Created: 2026-09-18

-- Cash paid out of Caja operativa to settle a reimbursement obligation.
-- Deliberately not added to create-cash-movement.dto.ts's MANUAL_MOVEMENT_TYPES
-- — a REIMBURSEMENT movement is only ever created by the reimbursement payout
-- flow, tied to a real obligation, never entered as a free-form manual movement.
ALTER TYPE cash_movement_type ADD VALUE 'REIMBURSEMENT';
