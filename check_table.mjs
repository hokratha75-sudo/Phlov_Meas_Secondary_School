import pg from "pg";

async function main() {
  const dbClient = new pg.Client({
    connectionString: `postgresql://postgres:zFJPjCWnecvdnYZTIniHJBJpkjZPmKfp@turntable.proxy.rlwy.net:10222/railway`,
  });
  await dbClient.connect();
  try {
    const { rows } = await dbClient.query(`SELECT * FROM qr_login_tokens LIMIT 1`);
    console.log("Table exists!");
  } catch (err) {
    console.error("DB Query Failed:", err.message);
  }
  await dbClient.end();
}
main();
