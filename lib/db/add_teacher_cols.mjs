import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:@localhost:5432/highschool_hub',
});

async function run() {
  await client.connect();
  try {
    await client.query(`
      ALTER TABLE teachers 
      ADD COLUMN IF NOT EXISTS gender text,
      ADD COLUMN IF NOT EXISTS dob text,
      ADD COLUMN IF NOT EXISTS pob text,
      ADD COLUMN IF NOT EXISTS officer_id text,
      ADD COLUMN IF NOT EXISTS position text,
      ADD COLUMN IF NOT EXISTS education_level text,
      ADD COLUMN IF NOT EXISTS employment_date text;
    `);
    console.log('Columns added successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
