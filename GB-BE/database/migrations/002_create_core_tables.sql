-- Core multi-tenant tables: businesses and branches.
-- Every business-owned table elsewhere in the schema references business_id
-- (and branch_id when it applies) so queries can be scoped per tenant.

CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  legal_name VARCHAR(200),
  tax_id VARCHAR(50),
  email VARCHAR(150),
  phone VARCHAR(30),
  currency VARCHAR(3) NOT NULL DEFAULT 'COP',
  timezone VARCHAR(60) NOT NULL DEFAULT 'America/Bogota',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  name VARCHAR(150) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  phone VARCHAR(30),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT branches_business_id_name_key UNIQUE (business_id, name)
);

CREATE INDEX idx_businesses_is_active ON businesses (is_active);

CREATE INDEX idx_branches_business ON branches (business_id);
CREATE INDEX idx_branches_business_is_active ON branches (business_id, is_active);
