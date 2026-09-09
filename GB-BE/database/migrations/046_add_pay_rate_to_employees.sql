-- "Valor" (pay rate) and its frequency (per shift / week / month), so payments to each
-- employee can be tracked and a payment receipt (comprobante de pago) generated on demand.
ALTER TABLE employees ADD COLUMN pay_rate NUMERIC(12, 2);
ALTER TABLE employees ADD COLUMN pay_frequency VARCHAR(10);
ALTER TABLE employees ADD CONSTRAINT employees_pay_frequency_check
  CHECK (pay_frequency IS NULL OR pay_frequency IN ('SHIFT', 'WEEK', 'MONTH'));
