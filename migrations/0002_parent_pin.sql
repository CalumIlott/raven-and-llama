ALTER TABLE accounts ADD COLUMN parent_pin_hash TEXT;
ALTER TABLE account_sessions ADD COLUMN parent_verified_until INTEGER;
