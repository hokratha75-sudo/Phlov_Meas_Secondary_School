-- ============================================================================
-- Phlov Meas Secondary School - Daily Vacuum
-- ============================================================================
-- Run this via cron: psql -U postgres -d phlov_meas -f daily-vacuum.sql

-- Vacuum specific highly-transactional tables
VACUUM ANALYZE student_attendance;
VACUUM ANALYZE library_logs;
VACUUM ANALYZE student_monthly_scores;
VACUUM ANALYZE audit_log;
