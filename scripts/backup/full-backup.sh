#!/bin/bash
# ---------------------------------------------------------
# Phlov Meas Secondary School - Full Database & Files Backup
# ---------------------------------------------------------

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [ -f "$DIR/.env" ]; then
    source "$DIR/.env"
fi

# Make dependencies executable
chmod +x "$DIR/notify.sh" "$DIR/cloud-sync.sh"

# Configuration
DB_NAME=${DB_NAME:-"phlov_meas"}
DB_USER=${DB_USER:-"postgres"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}

BACKUP_ROOT_DIR=${BACKUP_ROOT_DIR:-"/var/backups/phlov_meas"}
DB_BACKUP_DIR="$BACKUP_ROOT_DIR/db/full"
FILES_BACKUP_DIR="$BACKUP_ROOT_DIR/files"
UPLOADS_DIR=${UPLOADS_DIR:-"/var/www/Phlov_Meas_Secondary_School/artifacts/api-server/uploads"}

RETENTION_DAYS=30
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_BACKUP_FILE="$DB_BACKUP_DIR/${DB_NAME}_full_${TIMESTAMP}.dump"
FILES_BACKUP_FILE="$FILES_BACKUP_DIR/uploads_${TIMESTAMP}.tar.gz"

# Ensure directories exist
mkdir -p "$DB_BACKUP_DIR"
mkdir -p "$FILES_BACKUP_DIR"

echo "================================================="
echo "Starting Full Backup at $(date)"
echo "================================================="

# 1. Database Backup (Custom format for pg_restore)
echo "Backing up database: $DB_NAME..."
# Note: Password should be provided via .pgpass file
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F c -f "$DB_BACKUP_FILE"

if [ $? -eq 0 ]; then
    DB_SIZE=$(du -h "$DB_BACKUP_FILE" | cut -f1)
    echo "Database backup successful ($DB_SIZE)."
else
    echo "Database backup failed!"
    "$DIR/notify.sh" "❌ <b>Backup Failed!</b>%0ADatabase backup failed for $DB_NAME."
    exit 1
fi

# 2. File Uploads Backup
if [ -d "$UPLOADS_DIR" ]; then
    echo "Backing up uploads directory: $UPLOADS_DIR..."
    tar -czf "$FILES_BACKUP_FILE" -C "$(dirname "$UPLOADS_DIR")" "$(basename "$UPLOADS_DIR")"
    if [ $? -eq 0 ]; then
        FILES_SIZE=$(du -h "$FILES_BACKUP_FILE" | cut -f1)
        echo "Files backup successful ($FILES_SIZE)."
    else
        echo "Files backup failed!"
        "$DIR/notify.sh" "❌ <b>Backup Failed!</b>%0AFile uploads backup failed."
        exit 1
    fi
else
    echo "Warning: Uploads directory $UPLOADS_DIR not found. Skipping files backup."
    FILES_SIZE="0B"
fi

# 3. Retention Policy (Delete backups older than RETENTION_DAYS)
echo "Applying retention policy ($RETENTION_DAYS days)..."
find "$DB_BACKUP_DIR" -type f -name "*.dump" -mtime +$RETENTION_DAYS -delete
find "$FILES_BACKUP_DIR" -type f -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# 4. Trigger Cloud Sync
echo "Triggering cloud sync..."
"$DIR/cloud-sync.sh"

# 5. Notify Success
MSG="✅ <b>Full Backup Successful</b>%0A"
MSG+="Database: <code>$DB_NAME</code>%0A"
MSG+="DB Size: $DB_SIZE%0A"
MSG+="Files Size: $FILES_SIZE%0A"
MSG+="Timestamp: $(date +"%Y-%m-%d %H:%M:%S")"
"$DIR/notify.sh" "$MSG"

echo "Full backup process completed successfully."
exit 0
