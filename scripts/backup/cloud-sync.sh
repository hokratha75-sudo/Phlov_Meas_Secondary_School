#!/bin/bash
# ---------------------------------------------------------
# Phlov Meas Secondary School - Cloud Sync Script (rclone)
# ---------------------------------------------------------

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [ -f "$DIR/.env" ]; then
    source "$DIR/.env"
fi

# Ensure notify script is executable
chmod +x "$DIR/notify.sh"

BACKUP_ROOT_DIR=${BACKUP_ROOT_DIR:-"/var/backups/phlov_meas"}
# rclone remote name configured via `rclone config`
CLOUD_REMOTE=${CLOUD_REMOTE:-"gdrive:PhlovMeasBackups"} 

echo "Starting cloud sync to $CLOUD_REMOTE at $(date)"

# Sync the entire backup directory (Full Backups, WAL Archives, Uploads) to the cloud.
# --update prevents overwriting newer files in destination if they exist
# --transfers limits concurrent uploads
rclone sync "$BACKUP_ROOT_DIR" "$CLOUD_REMOTE" --update --transfers=4 -v

if [ $? -eq 0 ]; then
    echo "Cloud sync completed successfully."
    "$DIR/notify.sh" "✅ <b>Cloud Sync Success</b>%0AAll backups synchronized to $CLOUD_REMOTE."
else
    echo "Cloud sync failed!"
    "$DIR/notify.sh" "❌ <b>Cloud Sync Failed!</b>%0ACould not synchronize backups to $CLOUD_REMOTE. Check server logs."
    exit 1
fi
