-- Default product categories requested for the menu: Bebidas, Tenders, Popcorn.
-- Idempotent: safe to re-run, skips businesses that already have a category
-- with that name.

INSERT INTO product_categories (business_id, name, display_order)
SELECT b.id, c.name, c.display_order
FROM businesses b
CROSS JOIN (VALUES
  ('Bebidas', 1),
  ('Tenders', 2),
  ('Popcorn', 3)
) AS c(name, display_order)
ON CONFLICT (business_id, name) DO NOTHING;
