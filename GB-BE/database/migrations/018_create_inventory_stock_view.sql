-- Stock is never stored as a column — it is always the signed sum of
-- inventory_movements. This view is the single place that encodes which
-- movement types add to stock and which subtract from it.

CREATE VIEW inventory_stock_view AS
SELECT
  business_id,
  branch_id,
  location_id,
  inventory_item_id,
  SUM(
    CASE
      WHEN movement_type IN ('PURCHASE', 'ADJUSTMENT_IN', 'TRANSFER_IN', 'RETURN', 'INITIAL_STOCK')
        THEN quantity
      ELSE -quantity
    END
  ) AS stock
FROM inventory_movements
GROUP BY business_id, branch_id, location_id, inventory_item_id;
