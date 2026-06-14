import pg from 'pg';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

const { Client } = pg;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in .env");
  }

  const client = new Client({ connectionString });
  await client.connect();
  console.log("✅ Connected to Railway PostgreSQL database.");

  // Check existing tables
  const { rows: tables } = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('teacher_leaves', 'teacher_leave_balances', 'teachers')
    ORDER BY table_name;
  `);
  console.log("📋 Existing relevant tables:", tables.map(r => r.table_name));

  const queries = [
    // Create teacher_leaves table
    `CREATE TABLE IF NOT EXISTS "teacher_leaves" (
      "id" serial PRIMARY KEY NOT NULL,
      "teacher_id" integer NOT NULL REFERENCES "teachers"("id") ON DELETE CASCADE,
      "leave_type" text NOT NULL,
      "total_days" integer NOT NULL,
      "start_date" text NOT NULL,
      "end_date" text NOT NULL,
      "reason" text NOT NULL,
      "address_during_leave" text NOT NULL,
      "status" text NOT NULL DEFAULT 'PENDING',
      "attachment_url" text,
      "signature_url" text,
      "admin_note" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,

    // Create teacher_leave_balances table
    `CREATE TABLE IF NOT EXISTS "teacher_leave_balances" (
      "id" serial PRIMARY KEY NOT NULL,
      "teacher_id" integer NOT NULL REFERENCES "teachers"("id") ON DELETE CASCADE,
      "academic_year" text NOT NULL,
      "allowed_days" integer NOT NULL DEFAULT 15,
      "used_days" integer NOT NULL DEFAULT 0,
      "remaining_days" integer NOT NULL DEFAULT 15,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
  ];

  for (const query of queries) {
    try {
      const tableName = query.match(/"(\w+)"/)?.[1] || 'unknown';
      console.log(`⏳ Creating table: ${tableName}...`);
      await client.query(query);
      console.log(`✅ Done: ${tableName}`);
    } catch (e) {
      console.error(`❌ Failed: ${e.message}`);
    }
  }

  // Verify
  const { rows: afterTables } = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('teacher_leaves', 'teacher_leave_balances')
    ORDER BY table_name;
  `);
  console.log("\n📋 Tables now present:", afterTables.map(r => r.table_name));

  await client.end();
  console.log("\n✅ Migration complete!");
}

main().catch(console.error);
