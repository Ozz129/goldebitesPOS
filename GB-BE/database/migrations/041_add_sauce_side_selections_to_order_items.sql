ALTER TABLE order_items
  ADD COLUMN sauce_ids UUID[] NOT NULL DEFAULT '{}',
  ADD COLUMN sauce_names TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN side_ids UUID[] NOT NULL DEFAULT '{}',
  ADD COLUMN side_names TEXT[] NOT NULL DEFAULT '{}';
