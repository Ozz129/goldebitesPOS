-- Goods receipts record what actually arrived against a purchase order
-- (possibly partial, possibly at a different real cost than planned).
-- Each receipt generates PURCHASE inventory movements and updates the
-- inventory item's current_cost; purchase_orders.status is derived from
-- comparing ordered vs received quantities rather than duplicated here.

CREATE TABLE goods_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  branch_id UUID NOT NULL REFERENCES branches (id),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders (id),
  received_by UUID REFERENCES users (id),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

CREATE TABLE goods_receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goods_receipt_id UUID NOT NULL REFERENCES goods_receipts (id) ON DELETE CASCADE,
  purchase_order_item_id UUID NOT NULL REFERENCES purchase_order_items (id),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items (id),
  quantity_received NUMERIC(14, 3) NOT NULL,
  unit_cost NUMERIC(14, 2) NOT NULL,
  CONSTRAINT goods_receipt_items_quantity_received_check CHECK (quantity_received > 0),
  CONSTRAINT goods_receipt_items_unit_cost_check CHECK (unit_cost >= 0)
);

CREATE INDEX idx_goods_receipts_business ON goods_receipts (business_id);
CREATE INDEX idx_goods_receipts_purchase_order ON goods_receipts (purchase_order_id);

CREATE INDEX idx_goods_receipt_items_receipt ON goods_receipt_items (goods_receipt_id);
CREATE INDEX idx_goods_receipt_items_po_item ON goods_receipt_items (purchase_order_item_id);
