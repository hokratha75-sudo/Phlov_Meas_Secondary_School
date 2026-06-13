#!/bin/bash
# ============================================================================
# Phlov Meas Secondary School - Master DBA Setup Script
# ============================================================================
# This script applies all Phase 3 (Procedures), Phase 4 (Triggers),
# and Phase 6 (Security) logic to the database.

DB_NAME=${DB_NAME:-"phlov_meas"}
DB_USER=${DB_USER:-"postgres"}
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DBA_DIR="$DIR/.."

echo "🚀 Starting Master DBA Setup for $DB_NAME..."

# Ensure extension
psql -U "$DB_USER" -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
psql -U "$DB_USER" -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"

echo "1. Creating Roles & Security Policies..."
psql -U "$DB_USER" -d "$DB_NAME" -f "$DBA_DIR/security/create-roles.sql"
psql -U "$DB_USER" -d "$DB_NAME" -f "$DBA_DIR/security/encryption-setup.sql"
psql -U "$DB_USER" -d "$DB_NAME" -f "$DBA_DIR/security/audit-tables.sql"

echo "2. Installing Stored Procedures..."
for file in "$DBA_DIR/procedures/"*.sql; do
    echo "   -> Running $file"
    psql -U "$DB_USER" -d "$DB_NAME" -f "$file"
done

echo "3. Installing Triggers & Auditing..."
for file in "$DBA_DIR/triggers/"*.sql; do
    echo "   -> Running $file"
    psql -U "$DB_USER" -d "$DB_NAME" -f "$file"
done

echo "4. Enabling Row Level Security..."
psql -U "$DB_USER" -d "$DB_NAME" -f "$DBA_DIR/security/row-level-security.sql"

echo "✅ Setup Complete!"
echo "Please add 'dba/config/crontab.txt' to your system crontab to enable automated maintenance."
