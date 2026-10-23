-- The courier is reminded, once, of a delivery assigned to them that they
-- have not started after a while (GB-BE DeliveryRemindersService). Cleared
-- when the delivery is assigned again, so the new courier gets theirs.
ALTER TABLE deliveries ADD COLUMN start_reminded_at TIMESTAMPTZ;
