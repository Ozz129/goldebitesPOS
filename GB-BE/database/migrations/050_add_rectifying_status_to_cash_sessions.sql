-- Migration: 050_add_rectifying_status_to_cash_sessions.sql
-- Created: 2026-09-12

-- Lets an admin reopen a CLOSED cash session for correction without touching the
-- branch's currently OPEN session — findOpenForBranch/getOpenSessionOrFail/
-- hasOpenSession all filter strictly on status='OPEN', so a RECTIFYING session
-- stays invisible to the normal sales/dashboard flow while it's being corrected.
ALTER TYPE cash_session_status ADD VALUE 'RECTIFYING';
