/**
 * Phlov Meas Secondary School - Database Alert Bot
 * Listens for PostgreSQL events and forwards them to Telegram.
 */
const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config({ path: '../../.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramAlert(message) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log('Telegram not configured. Skipping alert:', message);
        return;
    }
    
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });
    } catch (error) {
        console.error('Failed to send Telegram alert:', error.message);
    }
}

pool.connect((err, client, done) => {
    if (err) {
        console.error('Fatal error connecting to DB', err);
        process.exit(1);
    }
    
    console.log('✅ Alert Bot listening for database events...');
    
    client.query('LISTEN grade_updated');
    client.query('LISTEN leave_approved');
    
    client.on('notification', async (msg) => {
        const payload = JSON.parse(msg.payload);
        
        let text = '';
        if (msg.channel === 'grade_updated') {
            text = `🚨 <b>Grade Update Alert</b>\nStudent ID: ${payload.student_id}\nSubject: ${payload.subject}\nScore changed: ${payload.old_score} ➡️ ${payload.new_score}`;
        } else if (msg.channel === 'leave_approved') {
            text = `✅ <b>Leave Approved</b>\nTeacher ID: ${payload.teacher_id}\nFrom ${payload.start_date} to ${payload.end_date}`;
        }
        
        if (text) {
            await sendTelegramAlert(text);
        }
    });
});
