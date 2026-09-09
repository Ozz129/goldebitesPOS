-- Links a SALE cash movement back to the specific payment that generated it, so correcting
-- a payment's method later (e.g. it was marked "transferencia" but was actually "efectivo")
-- can also correct the matching movement instead of leaving the cash session's expected
-- cash total wrong.
ALTER TABLE cash_movements ADD COLUMN payment_id UUID REFERENCES payments (id);
