#!/bin/bash
# ------------------------------------------------------------------------------
# Phlov Meas Secondary School - Database Health Check Script
# ------------------------------------------------------------------------------
# Run via cron or manually to check the health of PostgreSQL

DB_NAME=${DB_NAME:-"phlov_meas"}
DB_USER=${DB_USER:-"postgres"}

echo "================================================="
echo "  DATABASE HEALTH REPORT: $DB_NAME"
echo "  Date: $(date)"
echo "================================================="

echo -e "\n1. Connection Usage (Current vs Max)"
psql -U $DB_USER -d $DB_NAME -t -c "
SELECT count(*), 
       (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_conn 
FROM pg_stat_activity;" | awk '{print "Active Connections: " $1 " / " $3}'

echo -e "\n2. Cache Hit Ratio (Should be > 99%)"
psql -U $DB_USER -d $DB_NAME -t -c "
SELECT 
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) * 100 as ratio
FROM pg_statio_user_tables;" | awk '{printf "Cache Hit Ratio: %.2f%%\n", $1}'

echo -e "\n3. Index Scan vs Sequential Scan Ratio"
psql -U $DB_USER -d $DB_NAME -t -c "
SELECT 
  sum(idx_scan) / (sum(idx_scan) + sum(seq_scan)) * 100 as ratio
FROM pg_stat_user_tables WHERE seq_scan + idx_scan > 0;" | awk '{printf "Index Scan Ratio: %.2f%%\n", $1}'

echo -e "\n4. Long Running Queries (> 5 seconds)"
psql -U $DB_USER -d $DB_NAME -c "
SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE state != 'idle' 
  AND (now() - pg_stat_activity.query_start) > interval '5 seconds';"

echo -e "\n5. Database Size & Growth"
psql -U $DB_USER -d $DB_NAME -t -c "
SELECT pg_size_pretty(pg_database_size('$DB_NAME')) as total_size;" | awk '{print "Total Database Size: " $1}'

echo -e "\n6. Top 5 Largest Tables"
psql -U $DB_USER -d $DB_NAME -c "
SELECT relname as \"Table\",
       pg_size_pretty(pg_total_relation_size(relid)) As \"Size\"
FROM pg_catalog.pg_statio_user_tables 
ORDER BY pg_total_relation_size(relid) DESC LIMIT 5;"

echo "================================================="
echo "Health check complete."
