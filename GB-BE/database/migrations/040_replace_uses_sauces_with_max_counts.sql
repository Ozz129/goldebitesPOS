ALTER TABLE products
  ADD COLUMN max_sauces SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN max_sides SMALLINT NOT NULL DEFAULT 0,
  ADD CONSTRAINT products_max_sauces_check CHECK (max_sauces >= 0),
  ADD CONSTRAINT products_max_sides_check CHECK (max_sides >= 0);

UPDATE products SET max_sauces = 1 WHERE uses_sauces = true;

ALTER TABLE products DROP COLUMN uses_sauces;
