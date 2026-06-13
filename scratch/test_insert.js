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
    console.log('Inserting test leave request...');
    const res = await client.query(`
      INSERT INTO teacher_leaves (
        teacher_id,
        leave_type,
        start_date,
        end_date,
        total_days,
        reason,
        address_during_leave,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `, [
      3, // teacher_id
      'SICK_LEAVE', // leave_type
      '2026-06-09', // start_date
      '2026-06-10', // end_date
      2, // total_days
      'ឈឺ/សម្រាកព្យាបាល', // reason
      'មិនបញ្ជាក់', // address_during_leave
      'PENDING' // status
    ]);
    console.log('Success!', res.rows[0]);
    
    // Clean up
    console.log('Cleaning up test leave request...');
    await client.query('DELETE FROM teacher_leaves WHERE id = $1', [res.rows[0].id]);
    console.log('Cleaned up.');
  } catch (err) {
    console.error('Error inserting:', err);
  }

  await client.end();
}

main().catch(console.error);
