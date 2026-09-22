-- Migration: 067_add_must_change_password_to_users.sql
-- Created: 2026-09-22

-- Forces a password change on next login when set — used for employee
-- accounts auto-provisioned with a known default password (or reset with a
-- fresh temporary one), so the default/temp value never stays valid long
-- term. Enforced by MustChangePasswordGuard, not just a frontend redirect.
ALTER TABLE users ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT false;
