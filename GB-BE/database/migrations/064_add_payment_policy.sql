-- Migration: 064_add_payment_policy.sql
-- Created: 2026-09-22

-- GOL-27: per-branch policy controlling whether an order must be fully paid
-- before it can be sent to kitchen (CONFIRMED). branches.payment_policy is
-- the admin-configurable setting; orders.payment_policy is a one-time copy
-- of that setting taken at order creation, so later branch changes never
-- retroactively affect an order already in flight.
ALTER TABLE branches
  ADD COLUMN payment_policy VARCHAR(20) NOT NULL DEFAULT 'PAY_AT_END',
  ADD CONSTRAINT branches_payment_policy_check CHECK (payment_policy IN ('PREPAY_REQUIRED', 'PAY_AT_END'));

ALTER TABLE orders
  ADD COLUMN payment_policy VARCHAR(20) NOT NULL DEFAULT 'PAY_AT_END',
  ADD CONSTRAINT orders_payment_policy_check CHECK (payment_policy IN ('PREPAY_REQUIRED', 'PAY_AT_END'));
