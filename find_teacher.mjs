import pg from "pg";

async function main() {
  const dbClient = new pg.Client({
    connectionString: `postgresql://postgres:@localhost:5432/highschool_hub`,
  });
  await dbClient.connect();
  const { rows } = await dbClient.query(`SELECT username FROM teachers LIMIT 1`);
  console.log("Teacher username:", rows[0]?.username);
  await dbClient.end();
}
main();
