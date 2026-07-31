-- Product catalog: categories and sellable products.

CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  name VARCHAR(120) NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT product_categories_business_id_name_key UNIQUE (business_id, name)
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  category_id UUID REFERENCES product_categories (id),
  name VARCHAR(150) NOT NULL,
  description TEXT,
  sku VARCHAR(60),
  sale_price NUMERIC(14, 2) NOT NULL DEFAULT 0,
  current_cost NUMERIC(14, 2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  track_inventory BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT products_business_id_sku_key UNIQUE (business_id, sku),
  CONSTRAINT products_sale_price_check CHECK (sale_price >= 0),
  CONSTRAINT products_current_cost_check CHECK (current_cost >= 0)
);

CREATE INDEX idx_products_business ON products (business_id);
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_business_is_active ON products (business_id, is_active);
