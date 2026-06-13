const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

let dbUrl = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    break;
  }
}

const client = new Client({ connectionString: dbUrl });

async function main() {
  await client.connect();
  
  // Show constraints of teacher_leaves
  const constraints = await client.query(`
    SELECT conname, pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conrelid = 'teacher_leaves'::regclass;
  `);
  console.log('--- CONSTRAINTS ---');
  console.log(constraints.rows);

  // Show columns of teacher_leaves
  const columns = await client.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'teacher_leaves';
  `);
  console.log('--- COLUMNS ---');
  console.log(columns.rows);

  await client.end();
}

main().catch(console.error);
