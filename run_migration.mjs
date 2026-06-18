import pg from "pg";
import fs from "fs";

async function main() {
  const dbClient = new pg.Client({
    connectionString: `postgresql://postgres:zFJPjCWnecvdnYZTIniHJBJpkjZPmKfp@turntable.proxy.rlwy.net:10222/railway`,
  });
  await dbClient.connect();
  try {
    const sql = fs.readFileSync("sql/0009_qr_login_tokens.sql", "utf-8");
    await dbClient.query(sql);
    console.log("Migration executed successfully!");
  } catch (err) {
    console.error("Migration Failed:", err.message);
  }
  await dbClient.end();
}
main();
