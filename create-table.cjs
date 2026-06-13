const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:@localhost:5432/highschool_hub' });
client.connect().then(() => {
  return client.query(`
    CREATE TABLE IF NOT EXISTS id_card_templates (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      "baseStyle" TEXT NOT NULL DEFAULT 'classic',
      config JSONB NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}).then(() => {
  console.log('Table created');
  client.end();
}).catch(e => console.error(e));
