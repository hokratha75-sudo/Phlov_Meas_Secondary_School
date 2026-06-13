import { config } from "dotenv";
import path from "path";
config({ path: path.resolve("../../.env") });

import { db, teacherLeaves } from "./src/index.ts";
import { desc } from "drizzle-orm";

async function run() {
  const all = await db.query.teacherLeaves.findMany({
    orderBy: [desc(teacherLeaves.createdAt)],
  });
  console.log("Total leaves in DB:", all.length);
  console.log("Leaves data:", all);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
