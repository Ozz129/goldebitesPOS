-- Migration: 057_add_is_visible_to_products.sql
-- Created: 2026-09-18

-- Independent of is_active: a product can be active (sellable, appears in
-- staff-facing order-taking) but hidden from customer-facing surfaces like
-- the public menu — e.g. internal surcharges the team adds to an invoice
-- that customers shouldn't see listed as a menu item.
ALTER TABLE products ADD COLUMN is_visible BOOLEAN NOT NULL DEFAULT true;
