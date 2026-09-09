-- Lets a cash session close also reconcile transfer payments, not just physical cash.
-- expected_transfer_amount is the sum of TRANSFER-tagged sales during the session;
-- actual/transfer_difference are only populated when the closer enters a counted amount.
ALTER TABLE cash_sessions
  ADD COLUMN expected_transfer_amount NUMERIC(14, 2),
  ADD COLUMN actual_transfer_amount NUMERIC(14, 2),
  ADD COLUMN transfer_difference_amount NUMERIC(14, 2);
