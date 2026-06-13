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
  
  // Update a teacher to have a specific link code for testing
  await client.query(`
    UPDATE teachers 
    SET telegram_link_code = 'PM-TEST01', telegram_chat_id = NULL 
    WHERE id = (SELECT id FROM teachers LIMIT 1);
  `);
  
  // Fetch the teacher info
  const res = await client.query(`
    SELECT name_kh, telegram_link_code 
    FROM teachers 
    WHERE telegram_link_code = 'PM-TEST01';
  `);
  
  console.log(res.rows);
  await client.end();
}

main().catch(console.error);
