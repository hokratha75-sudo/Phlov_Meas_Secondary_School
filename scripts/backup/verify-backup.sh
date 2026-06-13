#!/bin/bash
# ---------------------------------------------------------
# Phlov Meas Secondary School - Backup Verification
# ---------------------------------------------------------
# This script verifies the integrity of the latest custom 
# format PostgreSQL backup using pg_restore.

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [ -f "$DIR/.env" ]; then
    source "$DIR/.env"
fi

chmod +x "$DIR/notify.sh"

BACKUP_ROOT_DIR=${BACKUP_ROOT_DIR:-"/var/backups/phlov_meas"}
DB_BACKUP_DIR="$BACKUP_ROOT_DIR/db/full"

echo "================================================="
echo "Starting Backup Verification at $(date)"
echo "================================================="

# Find the latest .dump file
LATEST_BACKUP=$(ls -t "$DB_BACKUP_DIR"/*.dump 2>/dev/null | head -n 1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "No backup files found in $DB_BACKUP_DIR."
    "$DIR/notify.sh" "⚠️ <b>Backup Verification Skipped</b>%0ANo database backups found."
    exit 1
fi

echo "Verifying latest backup: $LATEST_BACKUP..."

# Extract the table of contents to verify integrity without restoring data
pg_restore -l "$LATEST_BACKUP" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "Verification successful. The backup file is intact."
    "$DIR/notify.sh" "✅ <b>Backup Verification Success</b>%0AThe latest backup file is healthy and ready for restore."
else
    echo "Verification failed! The backup file may be corrupted."
    "$DIR/notify.sh" "🚨 <b>CRITICAL: Backup Corruption Detected!</b>%0AThe latest database backup file failed integrity checks."
    exit 1
fi

exit 0
