-- Adds the missing INITIAL_STOCK movement type (used once, when an
-- inventory item first onboards with existing stock). Count discrepancies
-- are deliberately NOT a separate enum value: they post as ADJUSTMENT_IN /
-- ADJUSTMENT_OUT (whichever matches the sign of the difference) tagged with
-- reference_type = 'inventory_count', since `quantity` is always positive
-- (CHECK quantity > 0) and a single "COUNT_CORRECTION" value can't encode
-- direction on its own.

ALTER TYPE inventory_movement_type ADD VALUE IF NOT EXISTS 'INITIAL_STOCK';
