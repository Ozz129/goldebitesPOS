-- Marketing: campaigns, coupons, content calendar and influencer tracking.
-- Performance metrics (spent/reach/clicks/conversions) and coupon usage are
-- entered/updated manually by staff; there is no ad-platform integration.

CREATE TABLE marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  name VARCHAR(150) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
  budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
  spent NUMERIC(12, 2) NOT NULL DEFAULT 0,
  reach INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT marketing_campaigns_channel_check CHECK (channel IN ('INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'WHATSAPP', 'GOOGLE_BUSINESS', 'META_ADS')),
  CONSTRAINT marketing_campaigns_status_check CHECK (status IN ('PLANNED', 'ACTIVE', 'FINISHED'))
);

CREATE INDEX idx_marketing_campaigns_business ON marketing_campaigns (business_id);

CREATE TABLE marketing_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  code VARCHAR(30) NOT NULL,
  discount_label VARCHAR(150) NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  max_usage INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT marketing_coupons_max_usage_check CHECK (max_usage > 0)
);

CREATE UNIQUE INDEX idx_marketing_coupons_business_code ON marketing_coupons (business_id, code) WHERE deleted_at IS NULL;

CREATE TABLE marketing_content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  scheduled_date DATE NOT NULL,
  title VARCHAR(200) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT marketing_content_items_channel_check CHECK (channel IN ('INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'WHATSAPP', 'GOOGLE_BUSINESS', 'META_ADS')),
  CONSTRAINT marketing_content_items_status_check CHECK (status IN ('PLANNED', 'PUBLISHED'))
);

CREATE INDEX idx_marketing_content_items_business ON marketing_content_items (business_id);

CREATE TABLE marketing_influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  name VARCHAR(150) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  followers INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'CONTACTED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT marketing_influencers_channel_check CHECK (channel IN ('INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'WHATSAPP', 'GOOGLE_BUSINESS', 'META_ADS')),
  CONSTRAINT marketing_influencers_status_check CHECK (status IN ('CONTACTED', 'NEGOTIATING', 'ACTIVE', 'FINISHED'))
);

CREATE INDEX idx_marketing_influencers_business ON marketing_influencers (business_id);

CREATE TRIGGER update_marketing_campaigns_updated_at
BEFORE UPDATE ON marketing_campaigns
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_coupons_updated_at
BEFORE UPDATE ON marketing_coupons
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_content_items_updated_at
BEFORE UPDATE ON marketing_content_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_influencers_updated_at
BEFORE UPDATE ON marketing_influencers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
