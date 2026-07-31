-- Loyalty program: per-business config columns on `businesses`, a rewards
-- catalog, and an append-only points ledger (earned on delivered orders,
-- redeemed against rewards).

ALTER TABLE businesses
  ADD COLUMN loyalty_points_per_thousand NUMERIC(6, 2) NOT NULL DEFAULT 1,
  ADD COLUMN loyalty_birthday_bonus_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN loyalty_birthday_bonus_points INTEGER NOT NULL DEFAULT 0;

CREATE TABLE loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  name VARCHAR(150) NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT loyalty_rewards_points_cost_check CHECK (points_cost > 0)
);

CREATE INDEX idx_loyalty_rewards_business ON loyalty_rewards (business_id);

CREATE TABLE loyalty_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  customer_id UUID NOT NULL REFERENCES customers (id),
  reward_id UUID REFERENCES loyalty_rewards (id),
  type VARCHAR(20) NOT NULL,
  points INTEGER NOT NULL,
  description VARCHAR(255) NOT NULL,
  created_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT loyalty_movements_type_check CHECK (type IN ('EARNED', 'REDEEMED', 'ADJUSTED'))
);

CREATE INDEX idx_loyalty_movements_business ON loyalty_movements (business_id);
CREATE INDEX idx_loyalty_movements_customer ON loyalty_movements (customer_id);

CREATE TRIGGER update_loyalty_rewards_updated_at
BEFORE UPDATE ON loyalty_rewards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
