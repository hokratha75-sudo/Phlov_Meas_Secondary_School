import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { requireAdmin } from "./auth";
import { sendDocumentToAdmin } from "../lib/telegram";
import zlib from "zlib";

const execAsync = promisify(exec);
export const backupsRouter = Router();

const BACKUP_STORAGE_PATH = process.env.BACKUP_STORAGE_PATH || "./backups";
const PG_DUMP_PATH = process.env.PG_DUMP_PATH || "pg_dump";
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || "30", 10);

// Ensure backup directory exists
const backupDir = path.resolve(process.cwd(), BACKUP_STORAGE_PATH);
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// GET /backups
backupsRouter.get("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const files = await fs.promises.readdir(backupDir);
    const backups = [];

    let id = 1;
    for (const file of files) {
      if (file.endsWith(".sql")) {
        const filePath = path.join(backupDir, file);
        const stats = await fs.promises.stat(filePath);
        
        backups.push({
          id: id++,
          filename: file,
          size: formatBytes(stats.size),
          date: stats.mtime.toISOString().replace('T', ' ').substring(0, 19),
          status: stats.size > 0 ? "success" : "failed"
        });
      }
    }

    // Sort by date descending
    backups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json(backups);
  } catch (error) {
    console.error("Error reading backups:", error);
    res.status(500).json({ message: "Failed to read backups directory" });
  }
});

// POST /backups
backupsRouter.post("/", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").substring(0, 19);
    const filename = `backup_db_${timestamp}.sql`;
    const filePath = path.join(backupDir, filename);
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      res.status(500).json({ message: "DATABASE_URL is not configured" });
      return;
    }

    // Run pg_dump
    // Using simple approach: wait for completion (timeout 5 mins handled by DB speed usually)
    const command = `"${PG_DUMP_PATH}" --no-owner --no-privileges --clean --if-exists "${dbUrl}" > "${filePath}"`;
    
    await execAsync(command, { timeout: 300000 }); // 5 minute timeout

    const stats = await fs.promises.stat(filePath);

    // Send to Telegram
    let sendFilePath = filePath;
    let sendFileName = filename;

    // Compress if larger than 45MB to bypass Telegram limit
    if (stats.size > 45 * 1024 * 1024) {
      const gzPath = filePath + '.gz';
      const readStream = fs.createReadStream(filePath);
      const writeStream = fs.createWriteStream(gzPath);
      const gzip = zlib.createGzip();
      await new Promise((resolve, reject) => {
        readStream.pipe(gzip).pipe(writeStream)
          .on('finish', resolve)
          .on('error', reject);
      });
      sendFilePath = gzPath;
      sendFileName = filename + '.gz';
    }

    // Fire and forget Telegram send
    sendDocumentToAdmin(sendFilePath, sendFileName, `📦 <b>Database Backup</b>\n📅 Date: ${timestamp}\n💽 Size: ${formatBytes(stats.size)}`)
      .catch(err => console.error("Telegram delivery failed:", err));

    res.json({
      id: Date.now(),
      filename,
      size: formatBytes(stats.size),
      date: stats.mtime.toISOString().replace('T', ' ').substring(0, 19),
      status: "success"
    });
  } catch (error: any) {
    console.error("Backup failed:", error);
    res.status(500).json({ message: "Backup failed: " + (error.message || "Unknown error") });
  }
});

// GET /backups/:filename
backupsRouter.get("/:filename", requireAdmin, (req: Request, res: Response): void => {
  const filename = req.params.filename as string;
  // Security check to prevent directory traversal
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    res.status(400).json({ message: "Invalid filename" });
    return;
  }

  const filePath = path.join(backupDir, filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: "Backup file not found" });
    return;
  }

  res.download(filePath, filename);
});

// POST /backups/:filename/send-telegram
backupsRouter.post("/:filename/send-telegram", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const filename = req.params.filename as string;
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    res.status(400).json({ message: "Invalid filename" });
    return;
  }

  const filePath = path.join(backupDir, filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: "Backup file not found" });
    return;
  }

  try {
    const stats = await fs.promises.stat(filePath);
    let sendFilePath = filePath;
    let sendFileName = filename;

    if (stats.size > 45 * 1024 * 1024) {
      const gzPath = filePath + '.gz';
      // only compress if it doesn't already exist
      if (!fs.existsSync(gzPath)) {
        const readStream = fs.createReadStream(filePath);
        const writeStream = fs.createWriteStream(gzPath);
        const gzip = zlib.createGzip();
        await new Promise((resolve, reject) => {
          readStream.pipe(gzip).pipe(writeStream)
            .on('finish', resolve)
            .on('error', reject);
        });
      }
      sendFilePath = gzPath;
      sendFileName = filename + '.gz';
    }

    const success = await sendDocumentToAdmin(sendFilePath, sendFileName, `📦 <b>Database Backup (Resend)</b>\n📅 File: ${filename}\n💽 Size: ${formatBytes(stats.size)}`);
    
    if (success) {
      res.json({ message: "Sent to Telegram successfully" });
    } else {
      res.status(500).json({ message: "Failed to send to Telegram. Please check Bot Token or Chat ID." });
    }
  } catch (err: any) {
    res.status(500).json({ message: "Error sending to Telegram: " + err.message });
  }
});
