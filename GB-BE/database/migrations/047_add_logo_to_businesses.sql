-- Business logo, embedded into printed documents (kitchen tickets, invoices, payment receipts).
ALTER TABLE businesses ADD COLUMN logo_path VARCHAR(255);
ALTER TABLE businesses ADD COLUMN logo_mime_type VARCHAR(100);
