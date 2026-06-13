import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to database");

    // Add new profile fields to teachers table
    const columns = [
      { name: "family_status", type: "text" },
      { name: "degree_info", type: "text" },
      { name: "pedagogy_info", type: "text" },
      { name: "training_info", type: "text" },
      { name: "work_experience", type: "text" },
      { name: "teaching_skills", type: "text" },
      { name: "tech_skills", type: "text" },
      { name: "languages", type: "text" },
    ];

    for (const col of columns) {
      try {
        await client.query(`ALTER TABLE teachers ADD COLUMN ${col.name} ${col.type};`);
        console.log(`Added column ${col.name}`);
      } catch (err) {
        if (err.code === '42701') {
          console.log(`Column ${col.name} already exists, skipping.`);
        } else {
          console.error(`Error adding column ${col.name}:`, err.message);
        }
      }
    }

    console.log("Migration completed.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

run();
