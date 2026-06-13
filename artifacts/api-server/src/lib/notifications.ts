import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { sendToParentsChannel, sendToTeachersChannel, sendDirectMessage } from './telegram';
import { db, teachers, students } from '@workspace/db';
import { eq } from 'drizzle-orm';

// Ensure env vars are loaded
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

export function setupDatabaseListeners() {
  pool.connect((err: Error | undefined, client: PoolClient | undefined, done: (release?: any) => void) => {
    if (err || !client) {
      console.error('❌ Error connecting to database for notifications:', err);
      return;
    }
    
    console.log('✅ Connected to database listener service.');
    
    // Subscribe to PostgreSQL channels
    client.query('LISTEN grade_updated');
    client.query('LISTEN leave_approved');
    client.query('LISTEN absence_alert');
    
    client.on('notification', async (msg: any) => {
      const { channel, payload } = msg;
      
      if (!payload) return;
      
      const data = JSON.parse(payload);
      console.log(`📢 Notification received on channel: [${channel}]`, data);
      
      switch (channel) {
        case 'grade_updated':
          await handleGradeUpdate(data);
          break;
          
        case 'leave_approved':
          await handleLeaveApproval(data);
          break;
          
        case 'absence_alert':
          await handleAbsenceWarning(data);
          break;
          
        default:
          console.log(`Unhandled notification channel: ${channel}`);
      }
    });
    
    // Handle disconnects and try to reconnect
    client.on('error', (err: Error) => {
      console.error('❌ Database listener client error:', err.message);
      done();
      setTimeout(setupDatabaseListeners, 5000);
    });
  });
}

// ─── REAL HANDLERS with Telegram Integration ──────────────────────────────

async function handleGradeUpdate(data: { student_id: number, subject: string, old_score: number, new_score: number }) {
  try {
    // Look up student info
    const [student] = await db.select().from(students).where(eq(students.id, data.student_id));
    if (!student) {
      console.warn(`Student ID ${data.student_id} not found for grade notification`);
      return;
    }

    const direction = data.new_score > data.old_score ? '📈' : '📉';
    const message = `${direction} <b>ការជូនដំណឹងអំពីពិន្ទុ</b>

👨‍🎓 សិស្ស: <b>${student.nameKh}</b> (${student.studentId})
📚 មុខវិជ្ជា: ${data.subject}
📊 ពិន្ទុចាស់: ${data.old_score} → ពិន្ទុថ្មី: <b>${data.new_score}</b>

សូមចូលទៅគេហទំព័រសាលា ឬប្រើ /grades ${student.studentId} ដើម្បីមើលពិន្ទុលម្អិត។`;

    // Send to parents channel
    await sendToParentsChannel(message);
    console.log(`📧 Grade update notification sent for Student ID ${data.student_id}`);
  } catch (error) {
    console.error('Failed to send grade update notification:', error);
  }
}

async function handleLeaveApproval(data: { teacher_id: number, start_date: string, end_date: string, status?: string }) {
  try {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, data.teacher_id));
    if (!teacher) {
      console.warn(`Teacher ID ${data.teacher_id} not found for leave notification`);
      return;
    }

    const statusText = data.status === 'REJECTED' ? 'បានបដិសេធ ❌' : 'បានអនុម័ត ✅';
    const message = `📋 <b>ការជូនដំណឹងអំពីច្បាប់</b>

👨‍🏫 គ្រូ: <b>${teacher.nameKh}</b>
📅 រយៈពេល: ${data.start_date} → ${data.end_date}
📌 ស្ថានភាព: <b>${statusText}</b>`;

    // Send DM to teacher if linked
    if (teacher.telegramChatId) {
      await sendDirectMessage(teacher.telegramChatId, message);
    }

    // Also send to teachers channel
    await sendToTeachersChannel(message);
    console.log(`📱 Leave notification sent for Teacher ID ${data.teacher_id}`);
  } catch (error) {
    console.error('Failed to send leave notification:', error);
  }
}

async function handleAbsenceWarning(data: { student_id: number, absence_count: number }) {
  try {
    const [student] = await db.select().from(students).where(eq(students.id, data.student_id));
    if (!student) {
      console.warn(`Student ID ${data.student_id} not found for absence notification`);
      return;
    }

    const severity = data.absence_count >= 10 ? '🔴' : data.absence_count >= 5 ? '🟡' : '🟢';
    const message = `${severity} <b>ការព្រមានអំពីវត្តមាន</b>

👨‍🎓 សិស្ស: <b>${student.nameKh}</b> (${student.studentId})
📊 ចំនួនអវត្តមាន: <b>${data.absence_count} ថ្ងៃ</b>

⚠️ សូមអាណាព្យាបាលយកចិត្តទុកដាក់!
📞 ទាក់ទងគ្រូប្រចាំថ្នាក់សម្រាប់ព័ត៌មានបន្ថែម។`;

    // Send to parents channel
    await sendToParentsChannel(message);
    console.log(`⚠️ Absence warning sent for Student ID ${data.student_id} (${data.absence_count} absences)`);
  } catch (error) {
    console.error('Failed to send absence warning notification:', error);
  }
}
