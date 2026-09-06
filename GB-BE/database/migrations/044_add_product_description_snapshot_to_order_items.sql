-- Snapshot of the product's description at order time, so the kitchen ticket can show it
-- even if the product's description changes later. Mirrors product_name_snapshot.
ALTER TABLE order_items ADD COLUMN product_description_snapshot TEXT;
