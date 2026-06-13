import { config } from "dotenv";
import path from "path";
config({ path: path.resolve("../../.env") });

import { db, teacherLeaves } from "@workspace/db";
import { desc } from "drizzle-orm";

async function run() {
  const all = await db.query.teacherLeaves.findMany({
    orderBy: [desc(teacherLeaves.createdAt)],
  });
  console.log("Total leaves in DB:", all.length);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
