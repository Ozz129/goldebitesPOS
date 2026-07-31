-- Customers and their delivery addresses.

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(150),
  phone VARCHAR(30),
  document_number VARCHAR(50),
  birth_date DATE,
  notes TEXT,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC(14, 2) NOT NULL DEFAULT 0,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT customers_total_orders_check CHECK (total_orders >= 0),
  CONSTRAINT customers_total_spent_check CHECK (total_spent >= 0),
  CONSTRAINT customers_loyalty_points_check CHECK (loyalty_points >= 0)
);

CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
  label VARCHAR(60),
  address TEXT NOT NULL,
  city VARCHAR(100),
  instructions TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_business ON customers (business_id);
CREATE INDEX idx_customers_phone ON customers (phone);
CREATE INDEX idx_customers_business_phone ON customers (business_id, phone);

CREATE INDEX idx_customer_addresses_customer ON customer_addresses (customer_id);
