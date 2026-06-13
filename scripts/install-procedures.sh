#!/bin/bash
# ------------------------------------------------------------------------------
# Phlov Meas Secondary School - Install Procedures & Triggers
# ------------------------------------------------------------------------------

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SQL_DIR="$DIR/../sql"

DB_NAME=${DB_NAME:-"phlov_meas"}
DB_USER=${DB_USER:-"postgres"}

echo "================================================="
echo "  INSTALLING PHASE 3 & 4 DATABASE LOGIC"
echo "  Database: $DB_NAME"
echo "================================================="

echo "1. Installing Phase 3: Stored Procedures & Functions..."
psql -U "$DB_USER" -d "$DB_NAME" -f "$SQL_DIR/0003_stored_procedures.sql"
if [ $? -ne 0 ]; then
    echo "❌ Error installing Stored Procedures. Aborting."
    exit 1
fi
echo "✅ Stored Procedures installed successfully."

echo "2. Installing Phase 4: Triggers & Auditing..."
psql -U "$DB_USER" -d "$DB_NAME" -f "$SQL_DIR/0004_triggers.sql"
if [ $? -ne 0 ]; then
    echo "❌ Error installing Triggers. Aborting."
    exit 1
fi
echo "✅ Triggers installed successfully."

echo "================================================="
echo "🎉 All database logic applied successfully!"
echo "Note: Make sure your api-server is running 'setupDatabaseListeners()'"
echo "      to receive the NOTIFY events."
echo "================================================="
