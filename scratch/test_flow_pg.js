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

  const userId = 123456789;
  const chatId = 123456789;
  const teacherId = 3;

  console.log('1. Starting /leave command simulation');
  // Clear any existing
  await client.query('DELETE FROM telegram_sessions WHERE user_id = $1', [userId]);

  // Insert session
  await client.query(`
    INSERT INTO telegram_sessions (user_id, chat_id, command, step, data)
    VALUES ($1, $2, $3, $4, $5::jsonb)
  `, [userId, chatId, '/leave', 'LEAVE_TYPE', JSON.stringify({ teacherId })]);

  // Step 2: leave_type:SICK_LEAVE
  console.log('2. Simulating leave_type:SICK_LEAVE');
  let res = await client.query('SELECT * FROM telegram_sessions WHERE user_id = $1', [userId]);
  let currentData = res.rows[0].data;
  console.log('Current Data in session:', currentData);
  
  await client.query(`
    UPDATE telegram_sessions 
    SET step = $1, data = $2::jsonb, updated_at = NOW()
    WHERE user_id = $3
  `, ['LEAVE_DATE', JSON.stringify({ ...currentData, type: 'SICK_LEAVE' }), userId]);

  // Step 3: leave_date:today (let's assume 2026-06-09)
  console.log('3. Simulating leave_date:today');
  res = await client.query('SELECT * FROM telegram_sessions WHERE user_id = $1', [userId]);
  currentData = res.rows[0].data;
  
  await client.query(`
    UPDATE telegram_sessions 
    SET step = $1, data = $2::jsonb, updated_at = NOW()
    WHERE user_id = $3
  `, ['LEAVE_DURATION', JSON.stringify({ ...currentData, startDate: '2026-06-09' }), userId]);

  // Step 4: leave_duration:2
  console.log('4. Simulating leave_duration:2');
  res = await client.query('SELECT * FROM telegram_sessions WHERE user_id = $1', [userId]);
  currentData = res.rows[0].data;
  
  const duration = 2;
  const endDate = '2026-06-10';
  await client.query(`
    UPDATE telegram_sessions 
    SET step = $1, data = $2::jsonb, updated_at = NOW()
    WHERE user_id = $3
  `, ['LEAVE_REASON', JSON.stringify({ ...currentData, duration, endDate }), userId]);

  // Step 5: leave_reason:ឈឺ/សម្រាកព្យាបាល
  console.log('5. Simulating leave_reason:ឈឺ/សម្រាកព្យាបាល');
  res = await client.query('SELECT * FROM telegram_sessions WHERE user_id = $1', [userId]);
  currentData = res.rows[0].data;
  
  await client.query(`
    UPDATE telegram_sessions 
    SET step = $1, data = $2::jsonb, updated_at = NOW()
    WHERE user_id = $3
  `, ['LEAVE_CONFIRM', JSON.stringify({ ...currentData, reason: 'ឈឺ/សម្រាកព្យាបាល' }), userId]);

  // Step 6: leave_confirm:yes
  console.log('6. Simulating leave_confirm:yes');
  res = await client.query('SELECT * FROM telegram_sessions WHERE user_id = $1', [userId]);
  currentData = res.rows[0].data;
  console.log('Final Data before insert:', currentData);

  try {
    const leaveType = currentData.type;
    const startDate = currentData.startDate;
    const endDate = currentData.endDate;
    const totalDaysNum = Number(currentData.duration);
    const reason = currentData.reason || "ស្នើសុំតាម Telegram Bot";
    const addressDuringLeave = "មិនបញ្ជាក់";

    console.log('Inserting into teacher_leaves...');
    const insertRes = await client.query(`
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
      currentData.teacherId,
      leaveType,
      startDate,
      endDate,
      totalDaysNum,
      reason,
      addressDuringLeave,
      'PENDING'
    ]);
    console.log('Insert Success! Item ID:', insertRes.rows[0].id);

    // Cleanup
    await client.query('DELETE FROM teacher_leaves WHERE id = $1', [insertRes.rows[0].id]);
    console.log('Cleanup leaves success.');
  } catch (err) {
    console.error('Insert Failed:', err);
  }

  // Cleanup session
  await client.query('DELETE FROM telegram_sessions WHERE user_id = $1', [userId]);
  console.log('Cleanup session success.');

  await client.end();
}

main().catch(console.error);
