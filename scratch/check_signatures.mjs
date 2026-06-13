import pg from "pg";

async function main() {
  const dbClient = new pg.Client({
    connectionString: `postgresql://postgres:@localhost:5432/highschool_hub`,
  });

  try {
    await dbClient.connect();
    console.log("Connected to highschool_hub DB.");
    
    const { rows: leaves } = await dbClient.query(`
      SELECT id, teacher_id, leave_type, signature_url, start_date, end_date
      FROM teacher_leaves
      ORDER BY id DESC
    `);
    
    console.log(`Found ${leaves.length} leave requests:`);
    console.log(JSON.stringify(leaves, null, 2));

    await dbClient.end();
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
