const { Client } = require('pg');

const client = new Client({ connectionString: 'postgresql://postgres:@localhost:5432/highschool_hub' });

async function main() {
  console.log("Connecting to highschool_hub database...");
  await client.connect();
  
  console.log("Creating parents table if not exists...");
  await client.query(`
    CREATE TABLE IF NOT EXISTS parents (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      parent_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      telegram_chat_id BIGINT UNIQUE,
      telegram_link_code TEXT,
      telegram_linked_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT unique_student_phone UNIQUE (student_id, phone)
    );
  `);
  console.log("parents table created/verified.");

  console.log("Adding teachers telegram_chat_id unique constraint if missing...");
  try {
    await client.query(`
      ALTER TABLE teachers ADD CONSTRAINT teachers_telegram_chat_id_unique UNIQUE (telegram_chat_id);
    `);
    console.log("teachers telegram_chat_id unique constraint added.");
  } catch (err) {
    if (err.code === '42P16') {
      console.log("teachers telegram_chat_id unique constraint already exists.");
    } else {
      console.error("Warning adding teachers constraint:", err.message);
    }
  }

  await client.end();
  console.log("Database schema synced via SQL.");
}

main().catch(err => {
  console.error("Error syncing database:", err);
  process.exit(1);
});
