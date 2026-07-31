-- Physical inventory counts (reconciliation) and transfers between
-- branches/locations. Both are "intent" records: the actual stock change
-- only happens when inventory_movements rows are generated (on completion),
-- keeping the movements ledger the single source of truth for stock.

CREATE TABLE inventory_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  branch_id UUID NOT NULL REFERENCES branches (id),
  location_id UUID REFERENCES inventory_locations (id),
  status VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS',
  started_by UUID REFERENCES users (id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_by UUID REFERENCES users (id),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE inventory_count_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  count_id UUID NOT NULL REFERENCES inventory_counts (id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items (id),
  expected_quantity NUMERIC(14, 3) NOT NULL,
  counted_quantity NUMERIC(14, 3),
  counted_at TIMESTAMPTZ,
  CONSTRAINT inventory_count_items_count_id_inventory_item_id_key UNIQUE (count_id, inventory_item_id),
  CONSTRAINT inventory_count_items_expected_quantity_check CHECK (expected_quantity >= 0),
  CONSTRAINT inventory_count_items_counted_quantity_check CHECK (counted_quantity IS NULL OR counted_quantity >= 0)
);

CREATE TABLE inventory_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  from_branch_id UUID NOT NULL REFERENCES branches (id),
  to_branch_id UUID NOT NULL REFERENCES branches (id),
  from_location_id UUID REFERENCES inventory_locations (id),
  to_location_id UUID REFERENCES inventory_locations (id),
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  requested_by UUID REFERENCES users (id),
  completed_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE inventory_transfer_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES inventory_transfers (id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items (id),
  quantity NUMERIC(14, 3) NOT NULL,
  CONSTRAINT inventory_transfer_items_transfer_id_inventory_item_id_key UNIQUE (transfer_id, inventory_item_id),
  CONSTRAINT inventory_transfer_items_quantity_check CHECK (quantity > 0)
);

CREATE INDEX idx_inventory_counts_business ON inventory_counts (business_id);
CREATE INDEX idx_inventory_counts_branch ON inventory_counts (branch_id);
CREATE INDEX idx_inventory_counts_status ON inventory_counts (status);

CREATE INDEX idx_inventory_count_items_count ON inventory_count_items (count_id);

CREATE INDEX idx_inventory_transfers_business ON inventory_transfers (business_id);
CREATE INDEX idx_inventory_transfers_from_branch ON inventory_transfers (from_branch_id);
CREATE INDEX idx_inventory_transfers_to_branch ON inventory_transfers (to_branch_id);
CREATE INDEX idx_inventory_transfers_status ON inventory_transfers (status);

CREATE INDEX idx_inventory_transfer_items_transfer ON inventory_transfer_items (transfer_id);
