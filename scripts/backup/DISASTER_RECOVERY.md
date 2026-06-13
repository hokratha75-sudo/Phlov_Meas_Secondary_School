# 🚨 DISASTER RECOVERY RUNBOOK 🚨
**Phlov Meas Secondary School Database Administration**

This document outlines the procedures for restoring the database and system in the event of a failure.

---

## ⚙️ Initial System Configuration

Before backups or PITR can work, the production PostgreSQL server and Cron must be configured.

### 1. PostgreSQL Configuration (`postgresql.conf`)
To enable WAL archiving (required for Incremental Backups and Point-In-Time Recovery), edit your `postgresql.conf` (usually in `/etc/postgresql/15/main/postgresql.conf`):

```ini
# Change these settings
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /var/backups/phlov_meas/db/wal_archive/%f && cp %p /var/backups/phlov_meas/db/wal_archive/%f'
```
*Restart PostgreSQL after making these changes: `sudo systemctl restart postgresql`*

### 2. Cron Schedule (`crontab -e`)
Add the following to the root or `postgres` user crontab to automate the system:

```cron
# Full Backup: Every day at 2:00 AM
0 2 * * * /path/to/scripts/backup/full-backup.sh >> /var/log/phlov_meas_backup.log 2>&1

# WAL Management & Cloud Sync: Every 4 hours
0 */4 * * * /path/to/scripts/backup/incremental-backup.sh >> /var/log/phlov_meas_wal.log 2>&1

# Backup Verification: Every Sunday at 4:00 AM
0 4 * * 0 /path/to/scripts/backup/verify-backup.sh >> /var/log/phlov_meas_verify.log 2>&1
```

---

## 🛠 Recovery Procedures

### Scenario 1: Full System Restore (Total Server Loss)
*Use this if the entire server burned down.*

1. **Provision new server** and install PostgreSQL, Node.js, and rclone.
2. **Restore Cloud Backups**:
   ```bash
   rclone copy gdrive:PhlovMeasBackups /var/backups/phlov_meas/
   ```
3. **Restore Database**:
   Find the latest `.dump` file in `/var/backups/phlov_meas/db/full/`.
   ```bash
   createdb -U postgres phlov_meas
   pg_restore -U postgres -d phlov_meas -1 /var/backups/phlov_meas/db/full/phlov_meas_full_YYYYMMDD_HHMMSS.dump
   ```
4. **Restore Uploads**:
   ```bash
   cd /var/www/Phlov_Meas_Secondary_School/artifacts/api-server/
   tar -xzf /var/backups/phlov_meas/files/uploads_YYYYMMDD_HHMMSS.tar.gz
   ```

### Scenario 2: Single Table Recovery (Accidental Drop)
*Use this if someone accidentally dropped or deleted records from a specific table (e.g., `students`).*

You do not need to restore the whole database. You can extract just the table from the custom format dump.

```bash
# 1. Truncate the broken table
psql -U postgres -d phlov_meas -c "TRUNCATE TABLE students CASCADE;"

# 2. Restore ONLY the 'students' table data
pg_restore -U postgres -d phlov_meas --data-only -t students /var/backups/phlov_meas/db/full/phlov_meas_full_YYYYMMDD_HHMMSS.dump
```

### Scenario 3: Point-In-Time Recovery (PITR)
*Use this if ransomware encrypted the database at 14:00, and you want to rewind to 13:59.*

We have provided a script to automate this. 
**Requirements:** You must have a base backup (`base.tar.gz`) taken via `pg_basebackup` and the intact WAL archive directory.

1. Find the exact time just before the disaster.
2. Run the interactive script:
   ```bash
   sudo ./scripts/backup/pitr-restore.sh "2025-01-15 13:59:00"
   ```
3. The script will:
   - Stop PostgreSQL.
   - Move the corrupted data folder.
   - Extract the base backup.
   - Create `recovery.signal` and configure `postgresql.conf`.
   - Start PostgreSQL.
4. **Monitor** `/var/log/postgresql/postgresql-15-main.log` to watch the replay process. When finished, it will accept connections again.

---

## 🔒 Security & Credentials

### `.env` File Setup
Create a `.env` file in the `scripts/backup/` directory to hold credentials:

```env
# Backup Env
DB_NAME=phlov_meas
DB_USER=postgres
DB_HOST=localhost
DB_PORT=5432
BACKUP_ROOT_DIR=/var/backups/phlov_meas

# Cloud Sync
CLOUD_REMOTE=gdrive:PhlovMeasBackups

# Telegram Alerts
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890
```

### `.pgpass` Setup
To allow `pg_dump` to run without a password prompt in cron jobs:

1. Create/edit `~/.pgpass` for the user running the cron job (e.g., `root` or `postgres`):
   ```
   localhost:5432:phlov_meas:postgres:YOUR_DB_PASSWORD
   ```
2. Set strict permissions (CRITICAL):
   ```bash
   chmod 0600 ~/.pgpass
   ```
