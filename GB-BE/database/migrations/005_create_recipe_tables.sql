-- Recipes tie a product to the inventory items consumed to produce it.
-- recipe_items references inventory_items, created in the next migration,
-- so this table is created first and the FK is added once that table exists.

CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  product_id UUID NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  yield_quantity NUMERIC(14, 3) NOT NULL DEFAULT 1,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT recipes_yield_quantity_check CHECK (yield_quantity > 0),
  CONSTRAINT recipes_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE TABLE recipe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes (id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL,
  quantity NUMERIC(14, 3) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT recipe_items_quantity_check CHECK (quantity > 0),
  CONSTRAINT recipe_items_recipe_id_inventory_item_id_key UNIQUE (recipe_id, inventory_item_id)
);

CREATE INDEX idx_recipes_business ON recipes (business_id);
CREATE INDEX idx_recipe_items_recipe ON recipe_items (recipe_id);
