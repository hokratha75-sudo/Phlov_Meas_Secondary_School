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
  console.log('Connected to Database.');

  // Check if telegram_messages table exists
  const checkRes = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'telegram_messages'
    );
  `);
  
  if (!checkRes.rows[0].exists) {
    console.log('Creating telegram_messages table...');
    const migrationPath = path.join(__dirname, '..', 'sql', '0006_telegram_messages.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    await client.query(migrationSql);
    console.log('telegram_messages table created successfully!');
  } else {
    console.log('telegram_messages table already exists.');
  }

  // Also check telegram_sessions
  const checkRes2 = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'telegram_sessions'
    );
  `);

  if (!checkRes2.rows[0].exists) {
    console.log('Creating telegram_sessions table...');
    const migrationPath = path.join(__dirname, '..', 'sql', '0007_telegram_sessions.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    await client.query(migrationSql);
    console.log('telegram_sessions table created successfully!');
  } else {
    console.log('telegram_sessions table already exists.');
  }

  await client.end();
}

main().catch(console.error);
