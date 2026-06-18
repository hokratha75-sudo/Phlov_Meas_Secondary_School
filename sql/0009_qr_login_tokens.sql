-- ============================================================================
-- QR Login Tokens Table
-- ============================================================================
-- Description: Store one-time tokens for QR code based passwordless login
-- Author: Phlov Meas Secondary School
-- Date: 2026-06-17
-- ============================================================================

CREATE TABLE IF NOT EXISTS qr_login_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_qr_login_teacher FOREIGN KEY (user_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_qr_login_tokens_token ON qr_login_tokens(token);
CREATE INDEX idx_qr_login_tokens_user ON qr_login_tokens(user_id);
CREATE INDEX idx_qr_login_tokens_expires ON qr_login_tokens(expires_at);

COMMENT ON TABLE qr_login_tokens IS 'តារាងរក្សាទុក One-Time Token សម្រាប់ QR Code Login';
COMMENT ON COLUMN qr_login_tokens.token IS 'Token ចៃដន្យសម្រាប់ QR Code';
COMMENT ON COLUMN qr_login_tokens.expires_at IS 'ថ្ងៃ-ម៉ោងផុតកំណត់ (កំណត់ ៥ នាទី)';
COMMENT ON COLUMN qr_login_tokens.is_used IS 'បានប្រើហើយឬនៅ (One-time use)';
