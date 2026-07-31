-- Purchasing: purchase orders raised against a supplier and their line
-- items. Status is a plain VARCHAR so the application layer owns the
-- transition rules (DRAFT -> SUBMITTED -> APPROVED -> ... ) rather than
-- the schema.

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  branch_id UUID NOT NULL REFERENCES branches (id),
  supplier_id UUID NOT NULL REFERENCES suppliers (id),
  order_number VARCHAR(50) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_date DATE,
  subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT purchase_orders_business_id_order_number_key UNIQUE (business_id, order_number),
  CONSTRAINT purchase_orders_subtotal_check CHECK (subtotal >= 0),
  CONSTRAINT purchase_orders_tax_amount_check CHECK (tax_amount >= 0),
  CONSTRAINT purchase_orders_total_amount_check CHECK (total_amount >= 0)
);

CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders (id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items (id),
  quantity NUMERIC(14, 3) NOT NULL,
  unit_cost NUMERIC(14, 2) NOT NULL,
  total_cost NUMERIC(14, 2) NOT NULL,
  CONSTRAINT purchase_order_items_quantity_check CHECK (quantity > 0),
  CONSTRAINT purchase_order_items_unit_cost_check CHECK (unit_cost >= 0),
  CONSTRAINT purchase_order_items_total_cost_check CHECK (total_cost >= 0)
);

CREATE INDEX idx_purchase_orders_business ON purchase_orders (business_id);
CREATE INDEX idx_purchase_orders_branch ON purchase_orders (branch_id);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders (supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders (status);

CREATE INDEX idx_purchase_order_items_purchase_order ON purchase_order_items (purchase_order_id);
