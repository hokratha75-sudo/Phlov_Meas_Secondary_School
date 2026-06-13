#!/bin/bash
# ---------------------------------------------------------
# Phlov Meas Secondary School - Point-In-Time Recovery (PITR)
# ---------------------------------------------------------
# This script configures PostgreSQL to restore a database
# up to a specific point in time using a base backup and WALs.
# WARNING: This script stops the PostgreSQL service and replaces data!

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [ -f "$DIR/.env" ]; then
    source "$DIR/.env"
fi

TARGET_TIME="$1"

if [ -z "$TARGET_TIME" ]; then
    echo "Usage: ./pitr-restore.sh \"YYYY-MM-DD HH:MM:SS\""
    echo "Example: ./pitr-restore.sh \"2025-01-15 14:30:00\""
    exit 1
fi

PG_DATA_DIR=${PG_DATA_DIR:-"/var/lib/postgresql/15/main"}
BACKUP_ROOT_DIR=${BACKUP_ROOT_DIR:-"/var/backups/phlov_meas"}
WAL_ARCHIVE_DIR="$BACKUP_ROOT_DIR/db/wal_archive"
# Assuming you have pg_basebackup archives stored as base.tar.gz
BASE_BACKUP_FILE="$BACKUP_ROOT_DIR/db/base/base.tar.gz"

echo "================================================="
echo "WARNING: POINT-IN-TIME RECOVERY INITIATED"
echo "Target Time: $TARGET_TIME"
echo "================================================="
read -p "Are you sure you want to stop PostgreSQL and overwrite the current database? (y/N): " CONFIRM

if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    echo "Aborted."
    exit 0
fi

echo "1. Stopping PostgreSQL service..."
sudo systemctl stop postgresql

echo "2. Backing up current corrupted PGDATA..."
sudo mv "$PG_DATA_DIR" "${PG_DATA_DIR}_corrupted_$(date +"%Y%m%d_%H%M%S")"
sudo mkdir -p "$PG_DATA_DIR"
sudo chown postgres:postgres "$PG_DATA_DIR"

echo "3. Restoring base backup..."
sudo tar -xzf "$BASE_BACKUP_FILE" -C "$PG_DATA_DIR"

echo "4. Creating recovery.signal..."
sudo touch "$PG_DATA_DIR/recovery.signal"
sudo chown postgres:postgres "$PG_DATA_DIR/recovery.signal"

echo "5. Configuring postgresql.conf for PITR..."
sudo bash -c "cat >> $PG_DATA_DIR/postgresql.conf" << EOL

# PITR Recovery Settings Added Automatically
restore_command = 'cp $WAL_ARCHIVE_DIR/%f %p'
recovery_target_time = '$TARGET_TIME'
recovery_target_action = 'promote'
EOL

echo "6. Starting PostgreSQL service to begin recovery replay..."
sudo systemctl start postgresql

echo "================================================="
echo "Recovery initiated. PostgreSQL is currently replaying WAL files."
echo "Please monitor the PostgreSQL log files to verify when recovery completes."
echo "Once recovery is complete, the recovery.signal file will be automatically removed."
echo "================================================="
