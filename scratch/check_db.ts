import { db } from "../lib/db/src/index.ts";
import { sql } from "drizzle-orm";

async function check() {
  try {
    const result = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    console.log("Tables in database:", result.rows.map(r => r.table_name));
  } catch (error) {
    console.error("Error checking tables:", error);
  } finally {
    process.exit(0);
  }
}

check();
