-- ============================================================================
-- 03. ENCRYPTION SETUP
-- ============================================================================

-- Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive columns in students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_phone_encrypted BYTEA;
ALTER TABLE students ADD COLUMN IF NOT EXISTS address_encrypted BYTEA;

-- Create encryption functions
-- Usage: SELECT encrypt_data('012345678');
-- Note: Set 'app.encryption_key' via your connection session:
-- SET app.encryption_key = 'your-secret-key';

CREATE OR REPLACE FUNCTION encrypt_data(data TEXT) RETURNS BYTEA AS $$
    SELECT pgp_sym_encrypt(data, current_setting('app.encryption_key', true));
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION decrypt_data(data BYTEA) RETURNS TEXT AS $$
    SELECT pgp_sym_decrypt(data, current_setting('app.encryption_key', true));
$$ LANGUAGE sql;
