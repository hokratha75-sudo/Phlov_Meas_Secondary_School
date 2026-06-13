# 🚨 Phlov Meas Secondary School - Disaster Recovery Runbook

This document provides exact, step-by-step instructions for recovering the PostgreSQL database under various disaster scenarios.

---

## Scenario 1: Database Corruption
*Symptoms: Queries returning errors like "invalid page in block", "could not read block".*

1. **Detection:**
   - Run `/dba/monitoring/db-health.sh`.
   - Check PostgreSQL logs (`/var/log/postgresql/postgresql-15-main.log`).
2. **Recovery Steps:**
   ```bash
   sudo systemctl stop postgresql
   # Restore latest full backup
   sudo -u postgres pg_restore -C -d postgres /path/to/backup/phlov_meas_2026-06-05.dump
   ```
3. **Estimated Recovery Time:** 15-30 minutes.
4. **Prevention:** Rely on daily backups, regular `REINDEX`, and `VACUUM`.

---

## Scenario 2: Server Hardware Failure (Total Loss)
*Symptoms: VPS is completely dead, unreachable via SSH.*

1. **Detection:** Server monitoring (e.g., UptimeRobot) reports server DOWN for >15 minutes.
2. **Recovery Steps:**
   - Provision a new VPS with Ubuntu 22.04.
   - Install PostgreSQL 15.
   - Download the latest backup from Google Drive using `rclone`:
     ```bash
     rclone copy gdrive:phlov_meas_db_backups /tmp/backups
     ```
   - Restore database:
     ```bash
     sudo -u postgres pg_restore -C -d postgres /tmp/backups/latest.dump
     ```
   - Re-run `/dba/scripts/setup-dba.sh`.
3. **Estimated Recovery Time:** 2-4 hours.
4. **Prevention:** Use cloud-synced backups (Google Drive / AWS S3) via `/dba/backups/cloud-sync.sh`.

---

## Scenario 3: Accidental Data Deletion
*Symptoms: Admin accidentally deleted all student records or dropped a table.*

1. **Detection:** User reports missing data.
2. **Recovery Steps (Point-In-Time Recovery):**
   - We must restore using the WAL (Write-Ahead Logs) up to the minute *before* the deletion.
   - Edit `recovery.signal` and `postgresql.conf` to set `recovery_target_time = '2026-06-06 14:00:00'`.
   - Run `/dba/backups/pitr-restore.sh`.
3. **Estimated Recovery Time:** 1 hour.
4. **Prevention:** Enforce `readonly` and `app_teacher` Roles. Audit logs track *who* deleted the data.

---

## Scenario 4: Ransomware Attack
*Symptoms: Files on the server are encrypted; database is locked or corrupted maliciously.*

1. **Detection:** Unexpected `.enc` files on the filesystem; ransom note left in `/root`.
2. **Recovery Steps:**
   - **DO NOT** try to recover the infected server.
   - Shut down the infected VPS immediately.
   - Follow Scenario 2 (Server Hardware Failure) to rebuild on a completely fresh VPS.
   - Restore from a Cloud Backup that was taken *before* the infection date.
3. **Estimated Recovery Time:** 4-6 hours.
4. **Prevention:** Strong SSH keys, disable root password login, strict `pg_hba.conf` firewalling.

---

## Scenario 5: Natural Disaster (Fire/Flood in Data Center)
*Symptoms: Entire region or data center goes offline.*

1. **Detection:** Cloud provider status page shows region-wide outage.
2. **Recovery Steps:**
   - Provision a VPS in a completely different geographical region (e.g., Singapore instead of local).
   - Follow Scenario 2 (Restore from Google Drive).
3. **Estimated Recovery Time:** 2-4 hours.
4. **Prevention:** Multi-region cloud backup syncing.
