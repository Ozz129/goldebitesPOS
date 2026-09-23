-- Migration: 068_add_biweekly_pay_frequency.sql
-- Created: 2026-09-23

-- Adds "quincenal" as a pay frequency option — an employee can self-select
-- among WEEK/BIWEEKLY/MONTH for their own payroll cadence (see the "Nómina"
-- section of Mi Perfil); SHIFT stays admin-only, not offered there.
ALTER TABLE employees DROP CONSTRAINT employees_pay_frequency_check;
ALTER TABLE employees ADD CONSTRAINT employees_pay_frequency_check
  CHECK (pay_frequency IS NULL OR pay_frequency IN ('SHIFT', 'WEEK', 'BIWEEKLY', 'MONTH'));
