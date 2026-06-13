import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:@localhost:5432/highschool_hub',
});

async function run() {
  await client.connect();
  try {
    // 1. Create table library_logs if not exists
    console.log("Checking library_logs table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "library_logs" (
        "id" serial PRIMARY KEY NOT NULL,
        "student_id" integer NOT NULL,
        "book_title" text NOT NULL,
        "book_code" text,
        "borrow_date" timestamp DEFAULT now() NOT NULL,
        "return_date" timestamp,
        "book_status" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log("library_logs table checked/created.");

    // 2. Add due_date column if not exists
    try {
      await client.query('ALTER TABLE library_logs ADD COLUMN due_date timestamp;');
      console.log('due_date column added successfully.');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('due_date column already exists.');
      } else {
        throw err;
      }
    }

    // 3. Add foreign key if not exists
    try {
      await client.query(`
        ALTER TABLE "library_logs" 
        ADD CONSTRAINT "library_logs_student_id_students_id_fk" 
        FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE cascade;
      `);
      console.log('Foreign key constraint added successfully.');
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('multiple')) {
        console.log('Foreign key constraint already exists.');
      } else {
        throw err;
      }
    }

    console.log("Database migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}
run();
