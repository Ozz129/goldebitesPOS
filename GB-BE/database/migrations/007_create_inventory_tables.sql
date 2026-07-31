-- Inventory catalog, storage locations and the movement ledger. Stock is
-- never stored directly: it is always derived as a sum of movements (see
-- the inventory_stock_view created once the movements table exists).

CREATE TYPE inventory_movement_type AS ENUM (
  'PURCHASE',
  'SALE_CONSUMPTION',
  'WASTE',
  'ADJUSTMENT_IN',
  'ADJUSTMENT_OUT',
  'TRANSFER_IN',
  'TRANSFER_OUT',
  'RETURN'
);

CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  name VARCHAR(150) NOT NULL,
  sku VARCHAR(60),
  unit VARCHAR(30) NOT NULL,
  minimum_stock NUMERIC(14, 3) NOT NULL DEFAULT 0,
  current_cost NUMERIC(14, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT inventory_items_business_id_sku_key UNIQUE (business_id, sku),
  CONSTRAINT inventory_items_minimum_stock_check CHECK (minimum_stock >= 0),
  CONSTRAINT inventory_items_current_cost_check CHECK (current_cost >= 0)
);

CREATE TABLE inventory_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches (id),
  name VARCHAR(120) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT inventory_locations_branch_id_name_key UNIQUE (branch_id, name)
);

CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  branch_id UUID NOT NULL REFERENCES branches (id),
  location_id UUID REFERENCES inventory_locations (id),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items (id),
  movement_type inventory_movement_type NOT NULL,
  quantity NUMERIC(14, 3) NOT NULL,
  unit_cost NUMERIC(14, 2),
  reference_type VARCHAR(50),
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT inventory_movements_quantity_check CHECK (quantity > 0),
  CONSTRAINT inventory_movements_unit_cost_check CHECK (unit_cost IS NULL OR unit_cost >= 0)
);

ALTER TABLE recipe_items
  ADD CONSTRAINT recipe_items_inventory_item_id_fkey
  FOREIGN KEY (inventory_item_id) REFERENCES inventory_items (id);

CREATE INDEX idx_inventory_items_business ON inventory_items (business_id);

CREATE INDEX idx_inventory_locations_branch ON inventory_locations (branch_id);

CREATE INDEX idx_inventory_movements_business ON inventory_movements (business_id);
CREATE INDEX idx_inventory_movements_branch ON inventory_movements (branch_id);
CREATE INDEX idx_inventory_movements_item ON inventory_movements (inventory_item_id);
CREATE INDEX idx_inventory_movements_created_at ON inventory_movements (created_at);
CREATE INDEX idx_inventory_movements_branch_item_created_at
  ON inventory_movements (branch_id, inventory_item_id, created_at);
