-- Links an employee (HR record) to an optional login account (users row),
-- so an admin can generate access credentials for an employee without
-- merging the two concepts: an employee can exist with no login at all.

ALTER TABLE employees ADD COLUMN user_id UUID REFERENCES users (id);

CREATE UNIQUE INDEX idx_employees_user_id ON employees (user_id) WHERE user_id IS NOT NULL;
