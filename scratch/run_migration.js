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

const client = new Client({
  connectionString: dbUrl
});

async function main() {
  await client.connect();
  console.log("Connected to DB.");

  const sql = `
    ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "telegram_chat_id" integer;
    ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "telegram_link_code" text;
    ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "telegram_linked_at" timestamp;
  `;

  await client.query(sql);
  console.log("Migration executed successfully!");
  
  await client.end();
}

main().catch(console.error);
