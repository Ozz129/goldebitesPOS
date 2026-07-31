-- Suppliers used by the purchasing module.

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  name VARCHAR(150) NOT NULL,
  tax_id VARCHAR(50),
  contact_name VARCHAR(150),
  email VARCHAR(150),
  phone VARCHAR(30),
  address TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_suppliers_business ON suppliers (business_id);
