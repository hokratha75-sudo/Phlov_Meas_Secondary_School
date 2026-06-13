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
    console.log('Querying all teacher_leave_balances...');
    const res = await client.query('SELECT * FROM teacher_leave_balances;');
    console.log('Success!', res.rows);
  } catch (err) {
    console.error('Error querying:', err);
  }

  await client.end();
}

main().catch(console.error);
