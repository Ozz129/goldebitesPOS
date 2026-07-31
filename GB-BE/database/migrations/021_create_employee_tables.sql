-- Employee directory (HR) and weekly recurring shift schedule blocks.

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses (id),
  branch_id UUID REFERENCES branches (id),
  role_id UUID REFERENCES roles (id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(150),
  position VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  hire_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT employees_status_check CHECK (status IN ('ACTIVE', 'INACTIVE', 'ON_VACATION', 'ON_LEAVE'))
);

CREATE INDEX idx_employees_business ON employees (business_id);

CREATE TABLE employee_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT employee_shifts_day_of_week_check CHECK (day_of_week BETWEEN 0 AND 6)
);

CREATE INDEX idx_employee_shifts_employee ON employee_shifts (employee_id);

CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
