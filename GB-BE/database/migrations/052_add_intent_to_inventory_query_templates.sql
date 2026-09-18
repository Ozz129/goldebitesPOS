-- Migration: 052_add_intent_to_inventory_query_templates.sql
-- Created: 2026-09-19

-- "Intención": whether running the saved query should return the matching rows
-- ("detail") or an aggregate over them (count, total stock, total value, avg cost).
ALTER TABLE inventory_query_templates
  ADD COLUMN intent VARCHAR(20) NOT NULL DEFAULT 'detail';
