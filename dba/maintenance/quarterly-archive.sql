-- ============================================================================
-- Phlov Meas Secondary School - Quarterly Archive
-- ============================================================================
-- Run this via cron: psql -U postgres -d phlov_meas -f quarterly-archive.sql

-- Calls the stored procedure created in Phase 3
-- Archives attendance older than 3 years, and returned library logs older than 2 years.
CALL sp_archive_old_records(3, 2);
