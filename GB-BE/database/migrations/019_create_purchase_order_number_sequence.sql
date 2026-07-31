-- purchase_orders.order_number is VARCHAR (formatted as 'PO-000123' by the
-- application), but still needs a collision-free, race-safe source of the
-- numeric part. Mirrors the order_number_sequence already used by `orders`.

CREATE SEQUENCE purchase_order_number_sequence
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
