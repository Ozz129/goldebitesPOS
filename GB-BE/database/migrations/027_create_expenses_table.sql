-- Manual expense ledger, categorized to compute a basic P&L alongside real
-- order revenue (see AnalyticsService/OrdersService.getSalesSummary).

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  branch_id UUID REFERENCES branches (id),
  category VARCHAR(20) NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  expense_date DATE NOT NULL,
  created_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT expenses_category_check CHECK (category IN ('COGS', 'OPERATING', 'PAYROLL', 'MARKETING', 'OTHER')),
  CONSTRAINT expenses_amount_check CHECK (amount >= 0)
);

CREATE INDEX idx_expenses_business ON expenses (business_id);
CREATE INDEX idx_expenses_date ON expenses (expense_date);

CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON expenses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
