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
  
  console.log('--- TELEGRAM SESSIONS ---');
  const sessions = await client.query('SELECT * FROM telegram_sessions ORDER BY updated_at DESC LIMIT 10;');
  console.log(sessions.rows);

  console.log('--- TEACHER LEAVES ---');
  const leaves = await client.query('SELECT * FROM teacher_leaves ORDER BY id DESC LIMIT 5;');
  console.log(leaves.rows);

  console.log('--- LINKED TEACHERS ---');
  const teachers = await client.query('SELECT id, name_kh, telegram_chat_id, telegram_link_code FROM teachers WHERE telegram_chat_id IS NOT NULL LIMIT 10;');
  console.log(teachers.rows);

  await client.end();
}

main().catch(console.error);
