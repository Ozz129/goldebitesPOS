-- Waste/spoilage records, always tied to an inventory item and the user
-- who recorded them.

CREATE TABLE waste_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  branch_id UUID NOT NULL REFERENCES branches (id),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items (id),
  quantity NUMERIC(14, 3) NOT NULL,
  unit_cost NUMERIC(14, 2),
  reason VARCHAR(150) NOT NULL,
  notes TEXT,
  recorded_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT waste_records_quantity_check CHECK (quantity > 0),
  CONSTRAINT waste_records_unit_cost_check CHECK (unit_cost IS NULL OR unit_cost >= 0)
);

CREATE INDEX idx_waste_records_business ON waste_records (business_id);
CREATE INDEX idx_waste_records_branch ON waste_records (branch_id);
CREATE INDEX idx_waste_records_item ON waste_records (inventory_item_id);
CREATE INDEX idx_waste_records_created_at ON waste_records (created_at);
