-- Orders and payments. order_number is a business-wide sequential, human
-- readable number (not the internal UUID). order_items and payments keep
-- price/cost snapshots so edits to products later never change historical
-- orders.

CREATE TYPE order_type AS ENUM ('DINE_IN', 'TAKEAWAY', 'DELIVERY');

CREATE TYPE order_status AS ENUM (
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'DELIVERED',
  'CANCELLED'
);

CREATE TYPE payment_status AS ENUM (
  'PENDING',
  'PAID',
  'PARTIALLY_PAID',
  'REFUNDED',
  'CANCELLED'
);

CREATE TYPE payment_method AS ENUM ('CASH', 'CARD', 'TRANSFER', 'NEQUI', 'DAVIPLATA', 'OTHER');

CREATE SEQUENCE order_number_sequence
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  branch_id UUID NOT NULL REFERENCES branches (id),
  customer_id UUID REFERENCES customers (id),
  created_by UUID REFERENCES users (id),
  order_number BIGINT NOT NULL DEFAULT nextval('order_number_sequence'),
  order_type order_type NOT NULL,
  status order_status NOT NULL DEFAULT 'PENDING',
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  table_number VARCHAR(20),
  delivery_address TEXT,
  delivery_instructions TEXT,
  subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  confirmed_at TIMESTAMPTZ,
  prepared_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT orders_business_id_order_number_key UNIQUE (business_id, order_number),
  CONSTRAINT orders_subtotal_check CHECK (subtotal >= 0),
  CONSTRAINT orders_discount_amount_check CHECK (discount_amount >= 0),
  CONSTRAINT orders_tax_amount_check CHECK (tax_amount >= 0),
  CONSTRAINT orders_delivery_fee_check CHECK (delivery_fee >= 0),
  CONSTRAINT orders_total_amount_check CHECK (total_amount >= 0)
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id UUID REFERENCES products (id),
  product_name_snapshot VARCHAR(150) NOT NULL,
  quantity NUMERIC(14, 3) NOT NULL,
  unit_price NUMERIC(14, 2) NOT NULL,
  unit_cost_snapshot NUMERIC(14, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total_price NUMERIC(14, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT order_items_quantity_check CHECK (quantity > 0),
  CONSTRAINT order_items_unit_price_check CHECK (unit_price >= 0),
  CONSTRAINT order_items_unit_cost_snapshot_check CHECK (unit_cost_snapshot >= 0),
  CONSTRAINT order_items_discount_amount_check CHECK (discount_amount >= 0),
  CONSTRAINT order_items_total_price_check CHECK (total_price >= 0)
);

CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  previous_status order_status,
  new_status order_status NOT NULL,
  changed_by UUID REFERENCES users (id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders (id),
  payment_method payment_method NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  reference VARCHAR(150),
  status payment_status NOT NULL DEFAULT 'PAID',
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT payments_amount_check CHECK (amount > 0)
);

CREATE INDEX idx_orders_business ON orders (business_id);
CREATE INDEX idx_orders_branch ON orders (branch_id);
CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_created_at ON orders (created_at);
CREATE INDEX idx_orders_branch_status_created_at ON orders (branch_id, status, created_at);
CREATE INDEX idx_orders_business_created_at ON orders (business_id, created_at);

CREATE INDEX idx_order_items_order ON order_items (order_id);
CREATE INDEX idx_order_items_product ON order_items (product_id);

CREATE INDEX idx_order_status_history_order ON order_status_history (order_id);

CREATE INDEX idx_payments_order ON payments (order_id);
