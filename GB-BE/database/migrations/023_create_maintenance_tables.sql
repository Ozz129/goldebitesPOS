-- Equipment registry and its append-only maintenance intervention history.

CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  branch_id UUID REFERENCES branches (id),
  name VARCHAR(150) NOT NULL,
  serial_number VARCHAR(100),
  purchase_date DATE,
  warranty_until DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'OPERATIONAL',
  technical_supplier VARCHAR(150),
  next_maintenance_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT equipment_status_check CHECK (status IN ('OPERATIONAL', 'IN_MAINTENANCE', 'OUT_OF_SERVICE'))
);

CREATE INDEX idx_equipment_business ON equipment (business_id);

CREATE TABLE maintenance_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment (id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses (id),
  intervention_date DATE NOT NULL,
  description TEXT NOT NULL,
  cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_maintenance_interventions_equipment ON maintenance_interventions (equipment_id);

CREATE TRIGGER update_equipment_updated_at
BEFORE UPDATE ON equipment
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
