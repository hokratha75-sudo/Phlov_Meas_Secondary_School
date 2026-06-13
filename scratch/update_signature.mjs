import pg from "pg";

async function main() {
  const dbClient = new pg.Client({
    connectionString: `postgresql://postgres:@localhost:5432/highschool_hub`,
  });

  try {
    await dbClient.connect();
    console.log("Connected to highschool_hub DB.");
    
    const result = await dbClient.query(`
      UPDATE teacher_leaves
      SET signature_url = 'http://localhost:8080/uploads/1779695617321-657849999.png'
      WHERE id = 19
      RETURNING id, signature_url
    `);
    
    console.log("Updated result:", result.rows);

    await dbClient.end();
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
