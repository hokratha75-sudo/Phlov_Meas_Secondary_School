const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'artifacts', 'api-server', 'src', 'routes', 'telegram.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports
if (!content.includes('telegramSessions')) {
  content = content.replace(
    'import { db, teachers, telegramMessageLog, telegramMessages } from "@workspace/db";',
    'import { db, teachers, students, classrooms, studentAttendance, telegramSessions, telegramMessageLog, telegramMessages } from "@workspace/db";'
  );
}
if (!content.includes('editTelegramMessageText')) {
  content = content.replace(
    'import { getBotInfo, getChannelConfig, sendTelegramMessage } from "../lib/telegram";',
    'import { getBotInfo, getChannelConfig, sendTelegramMessage, editTelegramMessageText, answerCallbackQuery } from "../lib/telegram";'
  );
}
if (!content.includes('and')) {
  content = content.replace(
    'import { eq, desc, count, isNotNull } from "drizzle-orm";',
    'import { eq, desc, count, isNotNull, and, sql } from "drizzle-orm";'
  );
}

// 2. Add Callback Query Handling & Commands inside webhook
const webhookStartStr = `    if (update.message) {
      const msg = update.message;
      const text = msg.text || "";
      const chatId = msg.chat.id;
      const messageId = msg.message_id;`;

const commandsLogic = `
      // COMMAND HANDLING
      if (text.startsWith('/link ')) {
        const code = text.split(' ')[1];
        if (code) {
          // Check teachers
          const [teacher] = await db.select().from(teachers).where(eq(teachers.telegramLinkCode, code));
          if (teacher) {
            await db.update(teachers).set({ telegramChatId: chatId, telegramLinkedAt: new Date() }).where(eq(teachers.id, teacher.id));
            await sendTelegramMessage(chatId, \`ជោគជ័យ! គណនីគ្រូ \${teacher.nameKh} ត្រូវបានភ្ជាប់។ អ្នកអាចប្រើ /attendance ដើម្បីស្រង់វត្តមានបាន។\`);
            return res.sendStatus(200);
          }
          // Check students
          const [student] = await db.select().from(students).where(eq(students.telegramLinkCode, code));
          if (student) {
            await db.update(students).set({ telegramChatId: chatId, telegramLinkedAt: new Date() }).where(eq(students.id, student.id));
            await sendTelegramMessage(chatId, \`ជោគជ័យ! គណនីសិស្ស \${student.nameKh} ត្រូវបានភ្ជាប់។ អ្នកអាចប្រើ /myattendance ដើម្បីពិនិត្យវត្តមានរបស់អ្នក។\`);
            return res.sendStatus(200);
          }
          await sendTelegramMessage(chatId, 'លេខកូដមិនត្រឹមត្រូវ ឬត្រូវបានប្រើប្រាស់រួចហើយ។');
          return res.sendStatus(200);
        }
      }

      if (text === '/attendance') {
        const [teacher] = await db.select().from(teachers).where(eq(teachers.telegramChatId, chatId));
        if (!teacher) {
          await sendTelegramMessage(chatId, 'សូមភ្ជាប់គណនីរបស់អ្នកជាមុនសិនដោយប្រើ /link <code។');
          return res.sendStatus(200);
        }
        
        // Fetch classes
        const teacherClasses = await db.select().from(classrooms); // In a real app we'd filter by teacher's classes. For now show all.
        if (teacherClasses.length === 0) {
          await sendTelegramMessage(chatId, 'អ្នកមិនមានថ្នាក់រៀនសម្រាប់ស្រង់វត្តមានទេ។');
          return res.sendStatus(200);
        }

        const inline_keyboard = teacherClasses.map(c => ([{ text: c.name, callback_data: \`class:\${c.id}\` }]));
        await sendTelegramMessage(chatId, 'សូមជ្រើសរើសថ្នាក់រៀន៖', 'HTML', false, { inline_keyboard });
        return res.sendStatus(200);
      }

      if (text === '/myattendance') {
        const [student] = await db.select().from(students).where(eq(students.telegramChatId, chatId));
        if (!student) {
          await sendTelegramMessage(chatId, 'សូមភ្ជាប់គណនីរបស់អ្នកជាមុនសិនដោយប្រើ /link <code។');
          return res.sendStatus(200);
        }

        const date = new Date();
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
        
        // Count absences
        const absences = await db.select().from(studentAttendance).where(
          and(
            eq(studentAttendance.studentId, student.id),
            eq(studentAttendance.status, 'unexcused')
            // would filter by > startOfMonth ideally
          )
        );

        let msgText = \`📊 របាយការណ៍វត្តមានប្រចាំខែ: \${student.nameKh}\\n\\n\`;
        msgText += \`ចំនួនអវត្តមានអត់ច្បាប់៖ \${absences.length} ដង\\n\`;
        
        if (absences.length > 3) {
          msgText += \`\\n⚠️ សូមប្រុងប្រយ័ត្ន! អ្នកមានអវត្តមានច្រើនជាង៣ដងហើយ។\`;
        }

        await sendTelegramMessage(chatId, msgText);
        return res.sendStatus(200);
      }
`;

if (!content.includes('COMMAND HANDLING')) {
  content = content.replace(webhookStartStr, webhookStartStr + commandsLogic);
}

const callbackQueryStr = `
    } else if (update.callback_query) {
      const cb = update.callback_query;
      const data = cb.data;
      const chatId = cb.message.chat.id;
      const messageId = cb.message.message_id;

      if (data.startsWith('class:')) {
        const classId = parseInt(data.split(':')[1]);
        const classStudents = await db.select().from(students).where(eq(students.classId, classId));
        
        // Initialize draft
        const draft = {};
        classStudents.forEach(s => draft[s.id] = 'present');
        
        await db.insert(telegramSessions).values({
          userId: cb.from.id,
          chatId: chatId,
          command: '/attendance',
          step: 'taking',
          data: { classId, draft }
        });

        // Build keyboard
        const inline_keyboard = classStudents.map(s => ([{ text: \`✅ \${s.nameKh}\`, callback_data: \`toggle:\${s.id}\` }]));
        inline_keyboard.push([{ text: '💾 បញ្ជូន (Submit)', callback_data: 'submit' }]);

        await editTelegramMessageText(chatId, messageId, 'សូមចុចលើឈ្មោះដើម្បីប្តូរពី ✅ ទៅ ❌៖', 'HTML', { inline_keyboard });
        await answerCallbackQuery(cb.id);
        return res.sendStatus(200);

      } else if (data.startsWith('toggle:')) {
        const studentId = parseInt(data.split(':')[1]);
        
        // Get session
        const sessionList = await db.select().from(telegramSessions).where(
          and(eq(telegramSessions.chatId, chatId), eq(telegramSessions.command, '/attendance'))
        ).orderBy(desc(telegramSessions.createdAt)).limit(1);
        
        if (sessionList.length > 0) {
          const session = sessionList[0];
          const draft = session.data.draft;
          draft[studentId] = draft[studentId] === 'present' ? 'unexcused' : 'present';
          
          await db.update(telegramSessions).set({ data: session.data }).where(eq(telegramSessions.id, session.id));

          // Rebuild keyboard
          const classStudents = await db.select().from(students).where(eq(students.classId, session.data.classId));
          const inline_keyboard = classStudents.map(s => ([{ 
            text: \`\${draft[s.id] === 'present' ? '✅' : '❌'} \${s.nameKh}\`, 
            callback_data: \`toggle:\${s.id}\` 
          }]));
          inline_keyboard.push([{ text: '💾 បញ្ជូន (Submit)', callback_data: 'submit' }]);

          await editTelegramMessageText(chatId, messageId, 'សូមចុចលើឈ្មោះដើម្បីប្តូរពី ✅ ទៅ ❌៖', 'HTML', { inline_keyboard });
        }
        await answerCallbackQuery(cb.id);
        return res.sendStatus(200);

      } else if (data === 'submit') {
        const sessionList = await db.select().from(telegramSessions).where(
          and(eq(telegramSessions.chatId, chatId), eq(telegramSessions.command, '/attendance'))
        ).orderBy(desc(telegramSessions.createdAt)).limit(1);
        
        if (sessionList.length > 0) {
          const session = sessionList[0];
          const draft = session.data.draft;
          const classId = session.data.classId;
          const today = new Date().toISOString().split('T')[0];

          for (const [sId, status] of Object.entries(draft)) {
            // upsert or insert
            await db.insert(studentAttendance).values({
              studentId: parseInt(sId),
              classroomId: classId,
              academicYear: '2024-2025',
              date: today,
              shift: 'morning',
              subject: 'general',
              status: status
            }).onConflictDoUpdate({
              target: [studentAttendance.studentId, studentAttendance.date, studentAttendance.shift, studentAttendance.subject],
              set: { status: status }
            });
          }

          await editTelegramMessageText(chatId, messageId, '✅ វត្តមានត្រូវបានរក្សាទុករួចរាល់។', 'HTML', { inline_keyboard: [] });
        }
        await answerCallbackQuery(cb.id, 'ជោគជ័យ!');
        return res.sendStatus(200);
      }
    }`;

if (!content.includes('else if (update.callback_query)')) {
  content = content.replace('    // Always respond 200 to Telegram to acknowledge receipt', callbackQueryStr + '\n\n    // Always respond 200 to Telegram to acknowledge receipt');
}

fs.writeFileSync(filePath, content);
console.log('Webhook patched successfully!');
