import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:@localhost:5432/highschool_hub',
});

async function run() {
  await client.connect();
  try {
    await client.query('ALTER TABLE teacher_leaves ADD COLUMN signature_url text;');
    console.log('Column added successfully.');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('Column already exists.');
    } else {
      console.error(err);
    }
  } finally {
    await client.end();
  }
}
run();
