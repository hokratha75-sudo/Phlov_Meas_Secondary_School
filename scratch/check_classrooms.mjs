import pg from "pg";

async function main() {
  const dbClient = new pg.Client({
    connectionString: `postgresql://postgres:@localhost:5432/highschool_hub`,
  });

  try {
    await dbClient.connect();
    console.log("Connected to highschool_hub DB.");
    
    // Check classrooms
    const { rows: classes } = await dbClient.query(`
      SELECT id, name, grade, teacher_id FROM classrooms
    `);
    console.log("Classrooms:");
    console.log(classes);

    // Check teachers
    const { rows: ts } = await dbClient.query(`
      SELECT id, name_kh, username FROM teachers
    `);
    console.log("Teachers:");
    console.log(ts);

    // Check students
    const { rows: ss } = await dbClient.query(`
      SELECT id, name_kh, class_id FROM students
    `);
    console.log("Students sample (first 10):");
    console.log(ss.slice(0, 10));

    await dbClient.end();
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
