-- Fourth order fulfillment channel: quick order-and-pay-at-the-car flow.
-- Must be its own migration — a new enum value cannot be used in the same
-- transaction it was added in.

ALTER TYPE order_type ADD VALUE 'CAR_SERVICE';
