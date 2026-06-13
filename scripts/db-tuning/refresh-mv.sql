-- -----------------------------------------------------------------------------
-- Phlov Meas Secondary School - Materialized View Refresh Script
-- -----------------------------------------------------------------------------
-- This script is designed to be run via a cron job (e.g., daily at 2:00 AM)
-- Usage: psql -U postgres -d phlov_meas -f refresh-mv.sql

-- We use CONCURRENTLY so the view remains queryable during the refresh process.
-- Note: A UNIQUE INDEX is required on the view to use CONCURRENTLY.
-- We created 'idx_mv_attendance_date_class' in 0002_performance_indexes.sql

REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_attendance_summary;

-- (Add other materialized views here as the application grows)
