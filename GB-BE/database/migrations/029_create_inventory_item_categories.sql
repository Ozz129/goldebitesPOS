-- Categorization layer for inventory_items, mirroring product_categories.
-- Lets non-food stock (tableware, furniture, fixtures) be grouped separately
-- from kitchen supplies without any change to how items are purchased,
-- adjusted, counted, or optionally consumed via recipes.

CREATE TABLE inventory_item_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  name VARCHAR(120) NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT inventory_item_categories_business_id_name_key UNIQUE (business_id, name)
);

ALTER TABLE inventory_items ADD COLUMN category_id UUID REFERENCES inventory_item_categories (id);

CREATE INDEX idx_inventory_items_category ON inventory_items (category_id);
