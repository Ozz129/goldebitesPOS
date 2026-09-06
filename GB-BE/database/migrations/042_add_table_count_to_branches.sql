ALTER TABLE branches
  ADD COLUMN table_count SMALLINT NOT NULL DEFAULT 20,
  ADD CONSTRAINT branches_table_count_check CHECK (table_count > 0);
