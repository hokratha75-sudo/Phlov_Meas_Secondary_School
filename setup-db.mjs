#!/usr/bin/env node
/**
 * setup-db.mjs
 * ─────────────────────────────────────────────────────
 * Connects to your local PostgreSQL (Laragon) and creates
 * the "highschool_hub" database if it doesn't exist yet,
 * then seeds a default admin user.
 *
 * Run AFTER pnpm install:
 *   node setup-db.mjs
 * ─────────────────────────────────────────────────────
 */

import pg from "pg";
import bcrypt from "bcryptjs";

// ── config ───────────────────────────────────────────
const DB_NAME = "highschool_hub";
const ADMIN_USER = "admin";
const ADMIN_PASSWORD = "admin123"; // change after first login!

// Connect to the default "postgres" DB first (it always exists)
const ROOT_URL = `postgresql://postgres:@localhost:5432/postgres`;
// ─────────────────────────────────────────────────────

/** Generates a real bcrypt hash for the password */
function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

async function main() {
  console.log("\n🐘  High School Hub — Database Setup\n");

  // ── Step 1: Create database ───────────────────────
  console.log(`[1/3] Connecting to PostgreSQL at localhost:5432...`);
  const rootClient = new pg.Client({ connectionString: ROOT_URL });

  try {
    await rootClient.connect();
  } catch (err) {
    console.error("\n❌  Cannot connect to PostgreSQL.");
    console.error("    Make sure Laragon is running and PostgreSQL service is started.");
    console.error(`    Error: ${err.message}\n`);
    process.exit(1);
  }

  const { rows: existing } = await rootClient.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [DB_NAME]
  );

  if (existing.length === 0) {
    console.log(`[1/3] Creating database "${DB_NAME}"...`);
    await rootClient.query(`CREATE DATABASE ${DB_NAME}`);
    console.log(`      ✅ Database "${DB_NAME}" created.`);
  } else {
    console.log(`[1/3] Database "${DB_NAME}" already exists — skipping creation.`);
  }

  await rootClient.end();

  // ── Step 2: Run Drizzle push (create tables) ──────
  console.log(`\n[2/3] Pushing Drizzle schema to "${DB_NAME}"...`);
  console.log(`      ⚠️  Run this command manually in your terminal:`);
  console.log(`\n         pnpm --filter @workspace/db run push\n`);

  // ── Step 3: Seed admin user ───────────────────────
  console.log(`[3/3] Seeding admin user...`);

  const dbClient = new pg.Client({
    connectionString: `postgresql://postgres:@localhost:5432/${DB_NAME}`,
  });

  try {
    await dbClient.connect();
  } catch (err) {
    console.error(`\n❌  Cannot connect to "${DB_NAME}".`);
    console.error(`    Make sure you ran "pnpm --filter @workspace/db run push" first.`);
    console.error(`    Error: ${err.message}\n`);
    process.exit(1);
  }

  // Check if admin_users table exists
  const { rows: tables } = await dbClient.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'admin_users'
  `);

  if (tables.length === 0) {
    console.log(`\n⚠️  Table "admin_users" not found.`);
    console.log(`   Run "pnpm --filter @workspace/db run push" first, then re-run this script.\n`);
    await dbClient.end();
    process.exit(0);
  }

  const { rows: existing_admin } = await dbClient.query(
    `SELECT 1 FROM admin_users WHERE username = $1`,
    [ADMIN_USER]
  );

  const hash = hashPassword(ADMIN_PASSWORD);
  if (existing_admin.length === 0) {
    await dbClient.query(
      `INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)`,
      [ADMIN_USER, hash]
    );
    console.log(`      ✅ Admin user created: username="${ADMIN_USER}" / password="${ADMIN_PASSWORD}"`);
  } else {
    await dbClient.query(
      `UPDATE admin_users SET password_hash = $1 WHERE username = $2`,
      [hash, ADMIN_USER]
    );
    console.log(`      ✅ Admin user "${ADMIN_USER}" password updated with valid bcrypt hash.`);
  }

  await dbClient.end();

  console.log(`\n🎉  Setup complete!\n`);
  console.log(`    Next steps:`);
  console.log(`    1. Run: pnpm --filter @workspace/db run push     (create tables)`);
  console.log(`    2. Run: pnpm --filter @workspace/api-server run dev   (start backend)`);
  console.log(`    3. Run: pnpm --filter @workspace/school-website run dev (start frontend)`);
  console.log(`\n    Frontend → http://localhost:3000`);
  console.log(`    Backend  → http://localhost:8080\n`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
