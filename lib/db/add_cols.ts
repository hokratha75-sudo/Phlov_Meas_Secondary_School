import { Client } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: '../../.env' });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in .env");
  }

  const client = new Client({ connectionString });
  await client.connect();

  console.log("Connected to database. Adding missing columns...");

  const queries = [
    `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "framework" text;`,
    `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "additional_subjects" text;`,
    `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "additional_teaching_hours" integer;`,
    `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "designated_teaching_hours" integer;`,
    `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "remarks" text;`
  ];

  for (const query of queries) {
    try {
      console.log(`Running: ${query}`);
      await client.query(query);
    } catch (e) {
      console.error(`Failed: ${e.message}`);
    }
  }

  await client.end();
  console.log("Done.");
}

main().catch(console.error);
