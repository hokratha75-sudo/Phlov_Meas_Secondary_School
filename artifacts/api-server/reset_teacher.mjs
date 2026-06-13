import pg from "pg";
import bcrypt from "bcryptjs";

async function main() {
  const dbClient = new pg.Client({
    connectionString: `postgresql://postgres:@localhost:5432/highschool_hub`,
  });
  await dbClient.connect();
  const hash = bcrypt.hashSync('teacher123', 10);
  await dbClient.query(`UPDATE teachers SET password_hash = $1 WHERE username = 'bopha'`, [hash]);
  console.log("Teacher bopha password reset to teacher123");
  await dbClient.end();
}
main();
