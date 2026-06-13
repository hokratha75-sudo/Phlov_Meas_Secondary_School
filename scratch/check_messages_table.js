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
  
  try {
    console.log('Querying columns of telegram_messages...');
    const cols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'telegram_messages';
    `);
    console.log(cols.rows);

    console.log('Querying telegram_messages rows...');
    const res = await client.query('SELECT * FROM telegram_messages LIMIT 5;');
    console.log(res.rows);
  } catch (err) {
    console.error('Error querying:', err);
  }

  await client.end();
}

main().catch(console.error);
