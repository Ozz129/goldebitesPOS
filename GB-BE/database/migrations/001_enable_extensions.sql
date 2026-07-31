-- Enables extensions required across the schema:
-- pgcrypto: gen_random_uuid() for UUID primary keys.
-- citext: case-insensitive text, useful for emails.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
