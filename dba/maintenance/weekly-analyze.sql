-- ============================================================================
-- Phlov Meas Secondary School - Weekly Analyze
-- ============================================================================
-- Run this via cron: psql -U postgres -d phlov_meas -f weekly-analyze.sql

-- Updates query planner statistics for all tables in the current database
ANALYZE VERBOSE;
