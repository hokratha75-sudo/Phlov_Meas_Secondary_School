import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.on('uncaughtException', (err) => {
  console.error("FATAL UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error("FATAL UNHANDLED REJECTION:", reason);
  process.exit(1);
});

// Debug: Print the path where we are looking for .env
const envPath = path.resolve(__dirname, "../../../.env");
console.log("🔍 Loading .env from:", envPath);

dotenv.config({ path: envPath });

const [{ default: app }, { logger }, { initTelegramBot }, { setupDatabaseListeners }] = await Promise.all([
  import("./app"),
  import("./lib/logger"),
  import("./lib/bot"),
  import("./lib/notifications"),
]);

// Default to 8080 for local dev; on Replit PORT was required.
console.log("CRITICAL: Server starting on port 8080...");
const rawPort = process.env["PORT"] ?? "8080";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Start Telegram Bot Polling
initTelegramBot();

// Start Database Event Listeners for Telegram Notifications
setupDatabaseListeners();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
