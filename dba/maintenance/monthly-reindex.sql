-- ============================================================================
-- Phlov Meas Secondary School - Monthly Reindex
-- ============================================================================
-- Run this via cron: psql -U postgres -d phlov_meas -f monthly-reindex.sql

-- Safely rebuilds indexes concurrently to fix bloat
-- Requires PostgreSQL 12+
REINDEX DATABASE CONCURRENTLY phlov_meas;
