#!/bin/bash
# ------------------------------------------------------------------------------
# Phlov Meas Secondary School - Slow Query Analyzer
# ------------------------------------------------------------------------------
# Requires pg_stat_statements extension.
# Analyzes the top 10 slowest queries and suggests optimizations.

DB_NAME=${DB_NAME:-"phlov_meas"}
DB_USER=${DB_USER:-"postgres"}

echo "================================================="
echo "  SLOW QUERY ANALYSIS REPORT: $DB_NAME"
echo "  Date: $(date)"
echo "================================================="

echo "Top 10 Slowest Queries (By Average Execution Time):"
echo "-------------------------------------------------"

psql -U $DB_USER -d $DB_NAME -c "
SELECT 
    round((mean_exec_time)::numeric, 2) as mean_ms,
    calls,
    round((total_exec_time)::numeric, 2) as total_time_ms,
    rows,
    substring(query, 1, 80) || '...' as short_query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
"

echo "Top 10 Most Resource-Intensive Queries (By Total Time):"
echo "-------------------------------------------------"

psql -U $DB_USER -d $DB_NAME -c "
SELECT 
    round((total_exec_time)::numeric, 2) as total_time_ms,
    calls,
    round((mean_exec_time)::numeric, 2) as mean_ms,
    rows,
    substring(query, 1, 80) || '...' as short_query
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
"

echo "================================================="
echo "Recommendations:"
echo "- Queries appearing in 'By Total Time' with high 'calls' count should be cached or heavily indexed."
echo "- Queries in 'By Average Execution Time' with low calls might be missing specific multi-column indexes or doing full table scans."
echo "- Consider running 'EXPLAIN ANALYZE' on the specific query strings listed above to find sequential scans."
echo "================================================="

# Optionally clear stats after running report:
# psql -U $DB_USER -d $DB_NAME -c "SELECT pg_stat_statements_reset();"
