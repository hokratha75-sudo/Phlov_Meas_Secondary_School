-- ============================================================================
-- 04. COMPLIANCE & AUDIT TABLES
-- ============================================================================

-- Log all data exports (e.g., when a user downloads an Excel report)
CREATE TABLE IF NOT EXISTS export_log (
    id SERIAL PRIMARY KEY,
    user_id INT,
    export_type VARCHAR(50),
    record_count INT,
    exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET
);

-- Track login attempts for security auditing
CREATE TABLE IF NOT EXISTS login_attempts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    success BOOLEAN,
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET
);
