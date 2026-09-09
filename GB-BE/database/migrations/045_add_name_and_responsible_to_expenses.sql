-- "Nombre" (short label) and "Responsable" (who incurred/requested the expense) for the
-- simplified expense form surfaced under Compras. Nullable so existing rows stay valid;
-- new expenses require both at the DTO level.
ALTER TABLE expenses ADD COLUMN name VARCHAR(150);
ALTER TABLE expenses ADD COLUMN responsible VARCHAR(150);
