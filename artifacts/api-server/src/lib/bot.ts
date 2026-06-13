import TelegramBot from 'node-telegram-bot-api';
import { env } from 'process';
import { db, students, studentMonthlyScores, teachers, telegramSessions, teacherLeaves, teacherLeaveBalances, news } from '@workspace/db';
import { eq, desc, and, sql } from 'drizzle-orm';
import { sendDirectMessage, sendToTeachersChannel } from './telegram';
import { generateTokens } from '../utils/securityFunctions.js';

const token = env.TELEGRAM_BOT_TOKEN;

let bot: TelegramBot | null = null;

// Simple in-memory rate limiter: Map of chat ID to array of timestamps
const rateLimitMap = new Map<number, number[]>();
const RATE_LIMIT = 30; // 30 requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(chatId: number): boolean {
  const now = Date.now();
  let timestamps = rateLimitMap.get(chatId) || [];
  // Remove timestamps outside the window
  timestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  timestamps.push(now);
  rateLimitMap.set(chatId, timestamps);

  return timestamps.length > RATE_LIMIT;
}

// ─── Helper: Find teacher by Telegram chat ID ─────────────────────────────
async function findTeacherByChatId(chatId: number) {
  const results = await db.select().from(teachers).where(eq(teachers.telegramChatId, chatId)).limit(1);
  return results[0] || null;
}

// ─── Helper: Generate random link code ─────────────────────────────────────
function generateLinkCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars (0,O,1,I)
  let code = 'PM-'; // Phlov Meas prefix
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ─── Helper: Get academic year ─────────────────────────────────────────────
function getAcademicYear(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  if (month >= 10) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

// ─── Helper: Generate Calendar Inline Keyboard ──────────────────────────────
function generateCalendarKeyboard(year: number, month: number) {
  // month is 0-indexed (0 = Jan, 11 = Dec)
  const keyboard: any[] = [];
  
  // Month & Year Header
  const monthNames = [
    "មករា (Jan)", "កុម្ភៈ (Feb)", "មីនា (Mar)", "មេសា (Apr)", "ឧសភា (May)", "មិថុនា (Jun)",
    "កក្កដា (Jul)", "សីហា (Aug)", "កញ្ញា (Sep)", "តុលា (Oct)", "វិច្ឆិកា (Nov)", "ធ្នូ (Dec)"
  ];
  
  keyboard.push([
    { text: `📅 ${monthNames[month]} ${year}`, callback_data: "calendar_ignore" }
  ]);
  
  // Weekday Headers (Mon-Sun)
  const weekDays = ["ច (M)", "អ (T)", "ព (W)", "ព្រ (T)", "សុ (F)", "ស (S)", "អា (S)"];
  keyboard.push(weekDays.map(d => ({ text: d, callback_data: "calendar_ignore" })));
  
  // Days of the month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const numDays = lastDay.getDate();
  
  // Day of week of the first day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  // We want Monday-indexed (0 = Mon, 6 = Sun)
  let firstDayIndex = firstDay.getDay() - 1;
  if (firstDayIndex < 0) firstDayIndex = 6; // Sunday
  
  let row: any[] = [];
  
  // Fill empty spaces before the first day
  for (let i = 0; i < firstDayIndex; i++) {
    row.push({ text: " ", callback_data: "calendar_ignore" });
  }
  
  for (let day = 1; day <= numDays; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    row.push({ text: String(day), callback_data: `leave_date_pick:${dateStr}` });
    
    if (row.length === 7) {
      keyboard.push(row);
      row = [];
    }
  }
  
  // Fill empty spaces at the end of the last row
  if (row.length > 0) {
    while (row.length < 7) {
      row.push({ text: " ", callback_data: "calendar_ignore" });
    }
    keyboard.push(row);
  }
  
  // Navigation controls
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  
  keyboard.push([
    { text: "⬅️ មុន (Prev)", callback_data: `leave_date_nav:${prevYear}-${prevMonth}` },
    { text: "បោះបង់ (Cancel)", callback_data: "leave_date_cancel" },
    { text: "បន្ទាប់ (Next) ➡️", callback_data: `leave_date_nav:${nextYear}-${nextMonth}` }
  ]);
  
  return { inline_keyboard: keyboard };
}

export function initTelegramBot() {
  if (!token) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN is not set. Interactive bot is disabled.');
    return;
  }

  // Create a bot that uses 'polling' to fetch new updates
  bot = new TelegramBot(token, { polling: true });

  bot.on('polling_error', (error: any) => {
    console.error('Telegram Polling Error:', error.code || error.message);
  });

  bot.on('error', (error: any) => {
    console.error('Telegram Bot Error:', error);
  });

  console.log('✅ Telegram Bot polling started');

  // Middleware-like function for all text messages
  bot.on('message', async (msg) => {
    if (!msg.text || !msg.chat.id) return;
    
    // Rate Limiting
    if (isRateLimited(msg.chat.id)) {
      if (msg.text.startsWith('/')) { // Only warn on commands
        bot?.sendMessage(msg.chat.id, '⚠️ សូមរង់ចាំមួយភ្លែត! លោកអ្នកបានផ្ញើសារច្រើនពេកក្នុងពេលតែមួយ។ (Rate Limit Exceeded)');
      }
      return;
    }

    const text = msg.text.trim();
    // If the message is just a student ID (e.g., ST001 or ST-001)
    if (!text.startsWith('/') && /^ST-?\d{3,}$/i.test(text)) {
      let formattedId = text.toUpperCase();
      if (!formattedId.includes('-')) {
        formattedId = formattedId.replace('ST', 'ST-');
      }
      await handleGradesCommand(msg.chat.id, formattedId);
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. /start command
  // ═══════════════════════════════════════════════════════════════════════════
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMsg = `សួស្តី! ស្វាគមន៍មកកាន់ប្រព័ន្ធទំនាក់ទំនងផ្លូវការរបស់វិទ្យាល័យ ផ្លូវមាស។ 🏫\n\n🔗 គ្រូបង្រៀន៖ សូមប្រើ /link <code> ដើម្បីភ្ជាប់គណនី Telegram ជាមួយប្រព័ន្ធសាលា\n\nសូមប្រើប្រាស់ /help ដើម្បីមើលបញ្ជា (Commands) ផ្សេងៗ។`;
    bot?.sendMessage(chatId, welcomeMsg);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. /help command
  // ═══════════════════════════════════════════════════════════════════════════
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMsg = `📖 <b>បញ្ជីបញ្ជា (Commands) ប្រើប្រាស់៖</b>

<b>📌 ទូទៅ៖</b>
/start - ចាប់ផ្តើម Bot
/help - ជំនួយ
/grades - មើលពិន្ទុសិស្ស
/schedule - មើលកាលវិភាគ
/news - ព័ត៌មានចុងក្រោយ
/contact - ទំនាក់ទំនងសាលា

<b>👨‍🏫 សម្រាប់គ្រូបង្រៀន៖</b>
/link - ភ្ជាប់គណនី Telegram
/leave - ស្នើសុំច្បាប់
/mystatus - មើលសមតុល្យច្បាប់
/myinfo - មើលព័ត៌មានផ្ទាល់ខ្លួន
/cancel - បោះបង់ប្រតិបត្តិការ`;
    bot?.sendMessage(chatId, helpMsg, { parse_mode: 'HTML' });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. /grades command
  // ═══════════════════════════════════════════════════════════════════════════
  bot.onText(/^\/grades(?:\s+(.+))?$/, async (msg, match) => {
    const chatId = msg.chat.id;
    const studentCode = match ? match[1]?.trim() : '';

    if (!studentCode) {
      bot?.sendMessage(chatId, '❌ សូមបញ្ចូល Student ID។\nឧទាហរណ៍: /grades ST-001');
      return;
    }

    let formattedId = studentCode.toUpperCase();
    if (/^ST\d{3,}$/i.test(formattedId)) {
      formattedId = formattedId.replace('ST', 'ST-');
    }

    await handleGradesCommand(chatId, formattedId);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. /schedule command
  // ═══════════════════════════════════════════════════════════════════════════
  bot.onText(/\/schedule/, async (msg) => {
    const chatId = msg.chat.id;
    
    // Check if user is student or teacher
    const [student] = await db.select().from(students).where(eq(students.telegramChatId, chatId));
    const [teacher] = await db.select().from(teachers).where(eq(teachers.telegramChatId, chatId));
    
    if (!student && !teacher) {
      bot?.sendMessage(chatId, `❌ សូមភ្ជាប់គណនីរបស់អ្នកជាមុនសិន។\n\n🔗 ចូលទៅកាន់ Web App ដើម្បីភ្ជាប់ Telegram៖\n${process.env.ADMIN_URL}/profile/link-telegram`);
      return;
    }
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: "ចន្ទ", callback_data: "schedule_day:MON" },
          { text: "អង្គារ", callback_data: "schedule_day:TUE" },
          { text: "ពុធ", callback_data: "schedule_day:WED" }
        ],
        [
          { text: "ព្រហស្បតិ៍", callback_data: "schedule_day:THU" },
          { text: "សុក្រ", callback_data: "schedule_day:FRI" },
          { text: "សៅរ៍", callback_data: "schedule_day:SAT" }
        ],
        [
          { text: "📅 ប្រចាំសប្តាហ៍", callback_data: "schedule_day:ALL" }
        ]
      ]
    };
    
    bot?.sendMessage(chatId, "📅 *ជ្រើសរើសថ្ងៃដែលចង់មើលកាលវិភាគ៖*", {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. /attendance command
  // ═══════════════════════════════════════════════════════════════════════════
  bot.onText(/\/attendance/, (msg) => {
    const chatId = msg.chat.id;
    const adminUrl = process.env.ADMIN_URL || 'https://admin.phlovmeas.edu.kh';
    
    bot?.sendMessage(chatId, `✅ <b>មុខងារសម្គាល់វត្តមាន</b>\n\nសម្រាប់តែគ្រូបង្រៀនប៉ុណ្ណោះ។\n\n🔗 សូមភ្ជាប់គណនី Telegram របស់អ្នក៖\n${adminUrl}/profile/link-telegram\n\nបន្ទាប់ពីភ្ជាប់រួច សូមប្រើ /attendance ម្តងទៀត។`, { parse_mode: 'HTML' });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. /leave command — Interactive Wizard (with proper teacher auth)
  // ═══════════════════════════════════════════════════════════════════════════
  bot.onText(/\/leave/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    if (!userId) return;

    // Find teacher by linked Telegram account
    const teacher = await findTeacherByChatId(chatId);

    if (!teacher) {
      bot?.sendMessage(chatId, `❌ <b>គណនីមិនទាន់បានភ្ជាប់</b>\n\nលោកគ្រូ/អ្នកគ្រូត្រូវភ្ជាប់គណនី Telegram ជាមួយប្រព័ន្ធសាលាជាមុនសិន។\n\n📝 សូមសុំ Link Code ពីរដ្ឋបាលសាលា រួចប្រើ:\n<code>/link PM-XXXXXX</code>`, { parse_mode: 'HTML' });
      return;
    }

    // Insert or update session
    const existingSession = await db.select().from(telegramSessions).where(eq(telegramSessions.userId, userId));
    if (existingSession.length > 0) {
      await db.update(telegramSessions).set({
        command: '/leave',
        step: 'LEAVE_TYPE',
        data: { teacherId: teacher.id },
        updatedAt: new Date()
      }).where(eq(telegramSessions.userId, userId));
    } else {
      await db.insert(telegramSessions).values({
        userId,
        chatId,
        command: '/leave',
        step: 'LEAVE_TYPE',
        data: { teacherId: teacher.id }
      });
    }

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🏖 ច្បាប់ប្រចាំឆ្នាំ (Annual)', callback_data: 'leave_type:ANNUAL' },
          { text: '🤒 ច្បាប់ឈឺ (Sick)', callback_data: 'leave_type:SICK_LEAVE' }
        ],
        [
          { text: '👶 ច្បាប់សម្រាលកូន (Maternity)', callback_data: 'leave_type:MATERNITY' },
          { text: '💼 ធុរៈផ្ទាល់ខ្លួន (Personal)', callback_data: 'leave_type:PERSONAL' }
        ]
      ]
    };

    bot?.sendMessage(chatId, `📝 <b>សុំច្បាប់ឈប់សម្រាក៖</b>\n\nសួស្តី <b>${teacher.nameKh}</b>! 👋\nតើលោកគ្រូ/អ្នកគ្រូចង់សុំច្បាប់ប្រភេទអ្វី?`, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. /contact command
  // ═══════════════════════════════════════════════════════════════════════════
  bot.onText(/\/contact/, (msg) => {
    const chatId = msg.chat.id;
    bot?.sendMessage(chatId, `📞 <b>ព័ត៌មានទំនាក់ទំនង៖</b>\n\n- ទូរស័ព្ទ៖ 012 345 678\n- អ៊ីមែល៖ info@phlovmeas.edu.kh\n- ទីតាំង៖ បាត់ដំបង`, { parse_mode: 'HTML' });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. /link <code> — Link Telegram to teacher account
  // ═══════════════════════════════════════════════════════════════════════════
  bot.onText(/^\/link(?:\s+(.+))?$/, async (msg, match) => {
    const chatId = msg.chat.id;
    const code = match ? match[1]?.trim() : '';

    if (!code) {
      bot?.sendMessage(chatId, `🔗 <b>ភ្ជាប់គណនី Telegram</b>\n\nសូមបញ្ចូល Link Code ដែលទទួលបានពីរដ្ឋបាលសាលា៖\n<code>/link PM-XXXXXX</code>\n\nប្រសិនបើមិនទាន់មាន Code សូមទាក់ទងរដ្ឋបាលសាលា។`, { parse_mode: 'HTML' });
      return;
    }

    // Check if already linked
    const existingLink = await findTeacherByChatId(chatId);
    if (existingLink) {
      bot?.sendMessage(chatId, `✅ គណនី Telegram របស់អ្នកបានភ្ជាប់រួចហើយជាមួយ <b>${existingLink.nameKh}</b>`, { parse_mode: 'HTML' });
      return;
    }

    // Find teacher by link code
    const teacherResults = await db.select().from(teachers).where(eq(teachers.telegramLinkCode, code.toUpperCase())).limit(1);
    const teacher = teacherResults[0];

    if (!teacher) {
      bot?.sendMessage(chatId, `❌ Link Code មិនត្រឹមត្រូវ ឬផុតកំណត់។ សូមពិនិត្យម្តងទៀត ឬទាក់ទងរដ្ឋបាលសាលា។`);
      return;
    }

    // Link the account
    await db.update(teachers).set({
      telegramChatId: chatId,
      telegramLinkCode: null, // Consume the code
      telegramLinkedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(teachers.id, teacher.id));

    bot?.sendMessage(chatId, `🎉 <b>ភ្ជាប់គណនីជោគជ័យ!</b>\n\nសួស្តី <b>${teacher.nameKh}</b>! គណនី Telegram របស់អ្នកបានភ្ជាប់ជាមួយប្រព័ន្ធសាលារៀន。\n\n🔹 ឥឡូវនេះអ្នកអាចប្រើ:\n/leave - ស្នើសុំច្បាប់\n/mystatus - មើលសមតុល្យច្បាប់\n/myinfo - មើលព័ត៌មានផ្ទាល់ខ្លួន\n\n📲 អ្នកនឹងទទួលការជូនដំណឹងពីរដ្ឋបាលផ្ទាល់ក្នុង Telegram នេះ!`, { parse_mode: 'HTML' });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. /mystatus — Check leave balance
  // ═══════════════════════════════════════════════════════════════════════════
  bot.onText(/\/mystatus/, async (msg) => {
    const chatId = msg.chat.id;
    const teacher = await findTeacherByChatId(chatId);

    if (!teacher) {
      bot?.sendMessage(chatId, `❌ គណនីមិនទាន់បានភ្ជាប់។ សូមប្រើ /link <code> ដើម្បីភ្ជាប់គណនី Telegram។`, { parse_mode: 'HTML' });
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const academicYear = getAcademicYear(todayStr);

    // Get leave balance
    let balance = await db.query.teacherLeaveBalances.findFirst({
      where: and(
        eq(teacherLeaveBalances.teacherId, teacher.id),
        eq(teacherLeaveBalances.academicYear, academicYear)
      ),
    });

    // If no balance, create default
    if (!balance) {
      const [newBalance] = await db.insert(teacherLeaveBalances).values({
        teacherId: teacher.id,
        academicYear,
        allowedDays: 15,
        usedDays: 0,
        remainingDays: 15,
      }).returning();
      balance = newBalance;
    }

    // Get recent leave requests
    const recentLeaves = await db.query.teacherLeaves.findMany({
      where: eq(teacherLeaves.teacherId, teacher.id),
      orderBy: [desc(teacherLeaves.createdAt)],
      limit: 5,
    });

    const statusEmoji = (status: string) => {
      switch (status) {
        case 'APPROVED': return '✅';
        case 'REJECTED': return '❌';
        default: return '⏳';
      }
    };

    const leaveTypeLabel = (type: string) => {
      const map: Record<string, string> = {
        ANNUAL: 'ប្រចាំឆ្នាំ',
        SICK_LEAVE: 'ឈឺ',
        MATERNITY: 'សម្រាកកូន',
        PERSONAL: 'ផ្ទាល់ខ្លួន',
      };
      return map[type] || type;
    };

    let statusMsg = `📊 <b>ស្ថានភាពច្បាប់ - ${teacher.nameKh}</b>\n\n`;
    statusMsg += `📅 ឆ្នាំសិក្សា: <b>${academicYear}</b>\n`;
    statusMsg += `━━━━━━━━━━━━━━━━━━━━\n`;
    statusMsg += `🎯 ច្បាប់សរុប: <b>${balance.allowedDays} ថ្ងៃ</b>\n`;
    statusMsg += `📝 បានប្រើ: <b>${balance.usedDays} ថ្ងៃ</b>\n`;
    statusMsg += `💚 នៅសល់: <b>${balance.remainingDays} ថ្ងៃ</b>\n`;
    
    if (recentLeaves.length > 0) {
      statusMsg += `\n📋 <b>សំណើថ្មីៗ (${recentLeaves.length}):</b>\n`;
      for (const leave of recentLeaves) {
        statusMsg += `${statusEmoji(leave.status)} ${leaveTypeLabel(leave.leaveType)} | ${leave.totalDays}ថ្ងៃ | ${leave.startDate}\n`;
      }
    }

    bot?.sendMessage(chatId, statusMsg, { parse_mode: 'HTML' });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. /myinfo — View personal profile
  // ═══════════════════════════════════════════════════════════════════════════
  bot.onText(/\/myinfo/, async (msg) => {
    const chatId = msg.chat.id;
    const teacher = await findTeacherByChatId(chatId);

    if (!teacher) {
      bot?.sendMessage(chatId, `❌ គណនីមិនទាន់បានភ្ជាប់។ សូមប្រើ /link <code> ដើម្បីភ្ជាប់គណនី Telegram។`, { parse_mode: 'HTML' });
      return;
    }

    const genderText = teacher.gender === 'female' ? 'ស្រី' : teacher.gender === 'male' ? 'ប្រុស' : '—';

    let infoMsg = `👤 <b>ព័ត៌មានផ្ទាល់ខ្លួន</b>\n\n`;
    infoMsg += `━━━━━━━━━━━━━━━━━━━━\n`;
    infoMsg += `📛 ឈ្មោះ: <b>${teacher.nameKh}</b>\n`;
    infoMsg += `🔤 Name: <b>${teacher.nameEn}</b>\n`;
    infoMsg += `👤 ភេទ: ${genderText}\n`;
    infoMsg += `🎂 ថ្ងៃកំណើត: ${teacher.dob || '—'}\n`;
    infoMsg += `🏠 អាសយដ្ឋាន: ${teacher.address || '—'}\n`;
    infoMsg += `📞 ទូរស័ព្ទ: ${teacher.phone || '—'}\n`;
    infoMsg += `📧 អ៊ីមែល: ${teacher.email || '—'}\n`;
    infoMsg += `━━━━━━━━━━━━━━━━━━━━\n`;
    infoMsg += `💼 មុខងារ: ${teacher.position || '—'}\n`;
    infoMsg += `📚 មុខវិជ្ជា: ${teacher.subjectKh}\n`;
    infoMsg += `🆔 អត្តលេខ: ${teacher.officerId || '—'}\n`;
    infoMsg += `📅 ថ្ងៃចូលបម្រើ: ${teacher.employmentDate || '—'}\n`;
    infoMsg += `🔗 Telegram ភ្ជាប់: ✅ ${teacher.telegramLinkedAt ? new Date(teacher.telegramLinkedAt).toLocaleDateString() : ''}\n`;

    bot?.sendMessage(chatId, infoMsg, { parse_mode: 'HTML' });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. /news — Latest news
  // ═══════════════════════════════════════════════════════════════════════════
  bot.onText(/\/news/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      const latestNews = await db.select().from(news)
        .where(eq(news.isPublished, true))
        .orderBy(desc(news.publishedAt))
        .limit(5);

      if (latestNews.length === 0) {
        bot?.sendMessage(chatId, '📰 មិនមានព័ត៌មានថ្មីនៅឡើយទេ។');
        return;
      }

      let newsMsg = `📰 <b>ព័ត៌មានចុងក្រោយ (${latestNews.length}):</b>\n\n`;

      for (const article of latestNews) {
        const title = article.titleKh || article.titleEn;
        const date = new Date(article.publishedAt).toLocaleDateString('km-KH');
        const preview = (article.contentKh || article.contentEn).substring(0, 80);
        newsMsg += `📌 <b>${title}</b>\n`;
        newsMsg += `   📅 ${date}\n`;
        newsMsg += `   ${preview}...\n\n`;
      }

      newsMsg += `🔗 សូមចូលទៅ https://phlovmeas.edu.kh/news ដើម្បីអានបន្ថែម`;

      bot?.sendMessage(chatId, newsMsg, { parse_mode: 'HTML' });
    } catch (error) {
      console.error('[Bot] /news error:', error);
      bot?.sendMessage(chatId, '⚠️ មានបញ្ហាក្នុងការទាញយកទិន្នន័យព័ត៌មាន។');
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 12. /cancel — Cancel any active wizard
  // ═══════════════════════════════════════════════════════════════════════════
  bot.onText(/\/cancel/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    if (!userId) return;

    const session = await db.select().from(telegramSessions).where(eq(telegramSessions.userId, userId));
    if (session.length > 0) {
      await db.delete(telegramSessions).where(eq(telegramSessions.userId, userId));
      bot?.sendMessage(chatId, '✅ ប្រតិបត្តិការដែលកំពុងដំណើរការត្រូវបានបោះបង់។');
    } else {
      bot?.sendMessage(chatId, 'ℹ️ មិនមានប្រតិបត្តិការកំពុងដំណើរការទេ។');
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Callback Query Handler (for inline keyboards)
  // ═══════════════════════════════════════════════════════════════════════════
  bot.on('callback_query', async (query) => {
    const chatId = query.message?.chat.id;
    const userId = query.from.id;
    const data = query.data;
    
    if (!chatId || !data) return;

    // Security & State validation for /leave flow callbacks
    if (data.startsWith('leave_')) {
      const session = await db.select().from(telegramSessions).where(eq(telegramSessions.userId, userId));
      const hasValidSession = session.length > 0 && session[0].command === '/leave';
      let isStepValid = false;
      
      if (hasValidSession) {
        const step = session[0].step;
        if (data.startsWith('leave_type:')) isStepValid = (step === 'LEAVE_TYPE');
        else if (data.startsWith('leave_date:') || data.startsWith('leave_date_pick:') || data.startsWith('leave_date_nav:') || data === 'leave_date_cancel') {
          isStepValid = (step === 'LEAVE_DATE');
        }
        else if (data.startsWith('leave_duration:')) isStepValid = (step === 'LEAVE_DURATION');
        else if (data.startsWith('leave_reason:')) isStepValid = (step === 'LEAVE_REASON');
        else if (data.startsWith('leave_confirm:')) isStepValid = (step === 'LEAVE_CONFIRM');
      }
      
      if (!hasValidSession || !isStepValid) {
        bot?.sendMessage(chatId, `⚠️ ប្រតិបត្តិការនេះបានហួសពេល ឬមិនមានសុពលភាពឡើយ។ សូមប្រើ /leave សារជាថ្មី។`);
        bot?.answerCallbackQuery(query.id);
        return;
      }
    }

    if (data.startsWith('leave_type:')) {
      const type = data.split(':')[1];
      
      const session = await db.select().from(telegramSessions).where(eq(telegramSessions.userId, userId));
      if (session.length === 0 || session[0].command !== '/leave') return;

      const currentData = session[0].data as any;
      await db.update(telegramSessions).set({
        step: 'LEAVE_DATE',
        data: { ...currentData, type },
        updatedAt: new Date()
      }).where(eq(telegramSessions.userId, userId));

      const keyboard = {
        inline_keyboard: [
          [
            { text: '📅 ថ្ងៃនេះ (Today)', callback_data: 'leave_date:today' },
            { text: '📅 ថ្ងៃស្អែក (Tomorrow)', callback_data: 'leave_date:tomorrow' }
          ],
          [
            { text: '📅 ថ្ងៃផ្សេងទៀត (Custom Date)', callback_data: 'leave_date:custom' }
          ]
        ]
      };

      bot?.editMessageText(`✅ បានជ្រើសរើសប្រភេទ: <b>${type}</b>\n\nតើលោកគ្រូ/អ្នកគ្រូសុំច្បាប់ចាប់ពីថ្ងៃណា?`, {
        chat_id: chatId,
        message_id: query.message?.message_id,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      bot?.answerCallbackQuery(query.id);
    } else if (data.startsWith('leave_date:')) {
      const dateSelection = data.split(':')[1];
      
      const session = await db.select().from(telegramSessions).where(eq(telegramSessions.userId, userId));
      if (session.length === 0 || session[0].command !== '/leave') return;

      const currentData = session[0].data as any;

      if (dateSelection === 'custom') {
        const today = new Date();
        const calKeyboard = generateCalendarKeyboard(today.getFullYear(), today.getMonth());
        bot?.editMessageText(`📅 <b>សូមជ្រើសរើសថ្ងៃចាប់ផ្តើម (Select Start Date):</b>`, {
          chat_id: chatId,
          message_id: query.message?.message_id,
          parse_mode: 'HTML',
          reply_markup: calKeyboard
        });
        bot?.answerCallbackQuery(query.id);
        return;
      }

      const startDate = new Date();
      if (dateSelection === 'tomorrow') {
        startDate.setDate(startDate.getDate() + 1);
      }
      const dateStr = startDate.toISOString().split('T')[0];

      await db.update(telegramSessions).set({
        step: 'LEAVE_DURATION',
        data: { ...currentData, startDate: dateStr },
        updatedAt: new Date()
      }).where(eq(telegramSessions.userId, userId));

      const academicYear = getAcademicYear(dateStr);
      let balance = await db.query.teacherLeaveBalances.findFirst({
        where: and(
          eq(teacherLeaveBalances.teacherId, currentData.teacherId),
          eq(teacherLeaveBalances.academicYear, academicYear)
        ),
      });
      const remainingDays = balance ? balance.remainingDays : 15;

      const keyboard = {
        inline_keyboard: [
          [
            { text: '1 ថ្ងៃ', callback_data: 'leave_duration:1' },
            { text: '2 ថ្ងៃ', callback_data: 'leave_duration:2' },
            { text: '3 ថ្ងៃ', callback_data: 'leave_duration:3' }
          ],
          [
            { text: '5 ថ្ងៃ', callback_data: 'leave_duration:5' },
            { text: '7 ថ្ងៃ', callback_data: 'leave_duration:7' },
            { text: '14 ថ្ងៃ', callback_data: 'leave_duration:14' }
          ],
          [
            { text: '✍️ បញ្ចូលចំនួនថ្ងៃខ្លួនឯង (Custom)', callback_data: 'leave_duration:custom' }
          ]
        ]
      };

      let textMsg = `✅ បានជ្រើសរើសថ្ងៃ: <b>${dateStr}</b>\n\nតើលោកគ្រូ/អ្នកគ្រូសុំច្បាប់ប៉ុន្មានថ្ងៃ?`;
      if (currentData.type === 'ANNUAL') {
        textMsg = `✅ បានជ្រើសរើសថ្ងៃ: <b>${dateStr}</b>\n💚 ច្បាប់ប្រចាំឆ្នាំនៅសល់: <b>${remainingDays} ថ្ងៃ</b>\n\nតើលោកគ្រូ/អ្នកគ្រូសុំច្បាប់ប៉ុន្មានថ្ងៃ?`;
      }

      bot?.editMessageText(textMsg, {
        chat_id: chatId,
        message_id: query.message?.message_id,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      bot?.answerCallbackQuery(query.id);
    } else if (data.startsWith('leave_date_pick:')) {
      const dateStr = data.split(':')[1];
      
      const session = await db.select().from(telegramSessions).where(eq(telegramSessions.userId, userId));
      if (session.length === 0 || session[0].command !== '/leave') return;

      const currentData = session[0].data as any;

      await db.update(telegramSessions).set({
        step: 'LEAVE_DURATION',
        data: { ...currentData, startDate: dateStr },
        updatedAt: new Date()
      }).where(eq(telegramSessions.userId, userId));

      const academicYear = getAcademicYear(dateStr);
      let balance = await db.query.teacherLeaveBalances.findFirst({
        where: and(
          eq(teacherLeaveBalances.teacherId, currentData.teacherId),
          eq(teacherLeaveBalances.academicYear, academicYear)
        ),
      });
      const remainingDays = balance ? balance.remainingDays : 15;

      const keyboard = {
        inline_keyboard: [
          [
            { text: '1 ថ្ងៃ', callback_data: 'leave_duration:1' },
            { text: '2 ថ្ងៃ', callback_data: 'leave_duration:2' },
            { text: '3 ថ្ងៃ', callback_data: 'leave_duration:3' }
          ],
          [
            { text: '5 ថ្ងៃ', callback_data: 'leave_duration:5' },
            { text: '7 ថ្ងៃ', callback_data: 'leave_duration:7' },
            { text: '14 ថ្ងៃ', callback_data: 'leave_duration:14' }
          ],
          [
            { text: '✍️ បញ្ចូលចំនួនថ្ងៃខ្លួនឯង (Custom)', callback_data: 'leave_duration:custom' }
          ]
        ]
      };

      let textMsg = `✅ បានជ្រើសរើសថ្ងៃចាប់ផ្តើម: <b>${dateStr}</b>\n\nតើលោកគ្រូ/អ្នកគ្រូសុំច្បាប់ប៉ុន្មានថ្ងៃ?`;
      if (currentData.type === 'ANNUAL') {
        textMsg = `✅ បានជ្រើសរើសថ្ងៃចាប់ផ្តើម: <b>${dateStr}</b>\n💚 ច្បាប់ប្រចាំឆ្នាំនៅសល់: <b>${remainingDays} ថ្ងៃ</b>\n\nតើលោកគ្រូ/អ្នកគ្រូសុំច្បាប់ប៉ុន្មានថ្ងៃ?`;
      }

      bot?.editMessageText(textMsg, {
        chat_id: chatId,
        message_id: query.message?.message_id,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      bot?.answerCallbackQuery(query.id);
    } else if (data.startsWith('leave_date_nav:')) {
      const [yearStr, monthStr] = data.split(':')[1].split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      
      const calKeyboard = generateCalendarKeyboard(year, month);
      
      bot?.editMessageText(`📅 <b>សូមជ្រើសរើសថ្ងៃចាប់ផ្តើម (Select Start Date):</b>`, {
        chat_id: chatId,
        message_id: query.message?.message_id,
        parse_mode: 'HTML',
        reply_markup: calKeyboard
      });
      bot?.answerCallbackQuery(query.id);
    } else if (data === 'leave_date_cancel') {
      const keyboard = {
        inline_keyboard: [
          [
            { text: '📅 ថ្ងៃនេះ (Today)', callback_data: 'leave_date:today' },
            { text: '📅 ថ្ងៃស្អែក (Tomorrow)', callback_data: 'leave_date:tomorrow' }
          ],
          [
            { text: '📅 ថ្ងៃផ្សេងទៀត (Custom Date)', callback_data: 'leave_date:custom' }
          ]
        ]
      };
      bot?.editMessageText(`តើលោកគ្រូ/អ្នកគ្រូសុំច្បាប់ចាប់ពីថ្ងៃណា?`, {
        chat_id: chatId,
        message_id: query.message?.message_id,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      bot?.answerCallbackQuery(query.id);
    } else if (data === 'calendar_ignore') {
      bot?.answerCallbackQuery(query.id);
    } else if (data.startsWith('leave_duration:')) {
      const durationVal = data.split(':')[1];
      
      const session = await db.select().from(telegramSessions).where(eq(telegramSessions.userId, userId));
      if (session.length === 0 || session[0].command !== '/leave') return;

      const currentData = session[0].data as any;

      if (durationVal === 'custom') {
        await db.update(telegramSessions).set({
          step: 'LEAVE_DURATION_CUSTOM',
          updatedAt: new Date()
        }).where(eq(telegramSessions.userId, userId));

        bot?.editMessageText(`✍️ <b>សូមវាយបញ្ចូលចំនួនថ្ងៃសុំច្បាប់ (ឧទានហរណ៍៖ ៤ ឬ ១០)៖</b>`, {
          chat_id: chatId,
          message_id: query.message?.message_id,
          parse_mode: 'HTML'
        });
        bot?.answerCallbackQuery(query.id);
        return;
      }

      const duration = parseInt(durationVal, 10);

      const academicYear = getAcademicYear(currentData.startDate);
      let balance = await db.query.teacherLeaveBalances.findFirst({
        where: and(
          eq(teacherLeaveBalances.teacherId, currentData.teacherId),
          eq(teacherLeaveBalances.academicYear, academicYear)
        ),
      });
      const remainingDays = balance ? balance.remainingDays : 15;

      if (duration > remainingDays && currentData.type === 'ANNUAL') {
        bot?.sendMessage(chatId, `❌ មិនអាចសុំច្បាប់ <b>${duration} ថ្ងៃ</b> ទេ ព្រោះច្បាប់នៅសល់តែ <b>${remainingDays} ថ្ងៃ</b> ប៉ុណ្ណោះ។ សូមជ្រើសរើសចំនួនថ្ងៃតិចជាងនេះ៖`, { parse_mode: 'HTML' });
        return;
      }

      const endDate = new Date(currentData.startDate);
      endDate.setDate(endDate.getDate() + duration - 1);
      const endDateStr = endDate.toISOString().split('T')[0];

      await db.update(telegramSessions).set({
        step: 'LEAVE_REASON',
        data: { ...currentData, duration, endDate: endDateStr },
        updatedAt: new Date()
      }).where(eq(telegramSessions.userId, userId));

      const keyboard = {
        inline_keyboard: [
          [
            { text: '🤒 ឈឺ/សម្រាកព្យាបាល', callback_data: 'leave_reason:ឈឺ/សម្រាកព្យាបាល' },
          ],
          [
            { text: '👨‍👩‍👧 កិច្ចការគ្រួសារ', callback_data: 'leave_reason:កិច្ចការគ្រួសារ' },
          ],
          [
            { text: '📋 ធុរៈផ្ទាល់ខ្លួន', callback_data: 'leave_reason:ធុរៈផ្ទាល់ខ្លួន' },
          ],
          [
            { text: '📝 មូលហេតុផ្សេង...', callback_data: 'leave_reason:OTHER' },
          ]
        ]
      };

      bot?.editMessageText(`✅ រយៈពេល: <b>${duration} ថ្ងៃ</b> (${currentData.startDate} → ${endDateStr})\n\nតើអ្វីជាមូលហេតុនៃការសុំច្បាប់?`, {
        chat_id: chatId,
        message_id: query.message?.message_id,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      bot?.answerCallbackQuery(query.id);
    } else if (data.startsWith('leave_reason:')) {
      const reason = data.split(':')[1];
      
      const session = await db.select().from(telegramSessions).where(eq(telegramSessions.userId, userId));
      if (session.length === 0 || session[0].command !== '/leave') return;

      const currentData = session[0].data as any;

      if (reason === 'OTHER') {
        // Ask user to type their reason
        await db.update(telegramSessions).set({
          step: 'LEAVE_REASON_TEXT',
          data: { ...currentData },
          updatedAt: new Date()
        }).where(eq(telegramSessions.userId, userId));

        bot?.editMessageText(`📝 សូមវាយបញ្ចូលមូលហេតុនៃការសុំច្បាប់៖`, {
          chat_id: chatId,
          message_id: query.message?.message_id,
          parse_mode: 'HTML'
        });
        bot?.answerCallbackQuery(query.id);
        return;
      }

      // Go to confirmation with the selected reason
      await showLeaveConfirmation(chatId, userId, currentData, reason, query.message?.message_id);
      bot?.answerCallbackQuery(query.id);
    } else if (data.startsWith('leave_confirm:')) {
      const confirm = data.split(':')[1];
      
      const session = await db.select().from(telegramSessions).where(eq(telegramSessions.userId, userId));
      if (session.length === 0 || session[0].command !== '/leave') return;

      if (confirm === 'yes') {
        const currentData = session[0].data as any;
        
        try {
          // Direct database insertion to avoid CSRF and HTTP overhead
          const leaveType = currentData.type;
          const startDate = currentData.startDate;
          const endDate = currentData.endDate;
          const totalDaysNum = Number(currentData.duration);
          const reason = currentData.reason || "ស្នើសុំតាម Telegram Bot";
          const addressDuringLeave = "មិនបញ្ជាក់";
          
          if (leaveType === "ANNUAL" && totalDaysNum > 15) {
            bot?.editMessageText(`❌ ច្បាប់ឈប់ប្រចាំឆ្នាំ មិនអាចលើសពី ១៥ ថ្ងៃ ក្នុងមួយឆ្នាំឡើយ។`, { chat_id: chatId, message_id: query.message?.message_id, parse_mode: 'HTML' });
            await db.delete(telegramSessions).where(eq(telegramSessions.userId, userId));
            bot?.answerCallbackQuery(query.id);
            return;
          }

          if (leaveType === "MATERNITY" && totalDaysNum > 90) {
            bot?.editMessageText(`❌ ច្បាប់សម្រាកលំហែមាតុភាព មិនអាចលើសពី ៩០ ថ្ងៃឡើយ។`, { chat_id: chatId, message_id: query.message?.message_id, parse_mode: 'HTML' });
            await db.delete(telegramSessions).where(eq(telegramSessions.userId, userId));
            bot?.answerCallbackQuery(query.id);
            return;
          }

          // Generate academic year
          const d = new Date(startDate);
          const acadYear = (d.getMonth() + 1) >= 10 ? `${d.getFullYear()}-${d.getFullYear() + 1}` : `${d.getFullYear() - 1}-${d.getFullYear()}`;

          if (leaveType === "ANNUAL") {
            const balance = await db.query.teacherLeaveBalances.findFirst({
              where: and(
                eq(teacherLeaveBalances.teacherId, currentData.teacherId),
                eq(teacherLeaveBalances.academicYear, acadYear)
              ),
            });
            const remainingDays = balance ? balance.remainingDays : 15;
            if (remainingDays < totalDaysNum) {
              bot?.editMessageText(`❌ ច្បាប់ឈប់ប្រចាំឆ្នាំដែលនៅសល់មិនគ្រប់គ្រាន់ឡើយ (នៅសល់ ${remainingDays} ថ្ងៃ ប៉ុន្តែស្នើសុំ ${totalDaysNum} ថ្ងៃ)។`, { chat_id: chatId, message_id: query.message?.message_id, parse_mode: 'HTML' });
              await db.delete(telegramSessions).where(eq(telegramSessions.userId, userId));
              bot?.answerCallbackQuery(query.id);
              return;
            }
          }

          const [item] = await db.insert(teacherLeaves).values({
            teacherId: currentData.teacherId,
            leaveType,
            startDate,
            endDate,
            totalDays: totalDaysNum,
            reason,
            addressDuringLeave,
            status: "PENDING",
          }).returning();

          const result = item;

          const requestId = `PM-L-${result.id}`;

          bot?.editMessageText(`🎉 <b>សំណើសុំច្បាប់ត្រូវបានបញ្ជូនដោយជោគជ័យ!</b>\n\n📋 សេចក្តីសង្ខេប:\n- លេខសម្គាល់សំណើ (Request ID): <b>${requestId}</b>\n- ប្រភេទ៖ ${currentData.type}\n- រយៈពេល៖ ${currentData.duration} ថ្ងៃ\n- ចាប់ពី៖ ${currentData.startDate}\n- ដល់៖ ${currentData.endDate}\n- មូលហេតុ៖ ${currentData.reason}\n\n⏳ រង់ចាំការអនុម័តពីរដ្ឋបាលសាលា។\nអ្នកនឹងទទួលការជូនដំណឹងនៅពេលមានការឆ្លើយតប! 📲`, {
            chat_id: chatId,
            message_id: query.message?.message_id,
            parse_mode: 'HTML'
          });
          
          // Send notification to Admin Channel
          const [t] = await db.select().from(teachers).where(eq(teachers.id, currentData.teacherId));
          const teacherName = t?.nameKh || "លោកគ្រូ/អ្នកគ្រូ";
          const msg = `📝 <b>ពាក្យសុំច្បាប់ថ្មី</b>\n\nលោកគ្រូ/អ្នកគ្រូ៖ <b>${teacherName}</b>\nចំនួន៖ ${totalDaysNum} ថ្ងៃ\nប្រភេទ៖ ${leaveType}\nមូលហេតុ៖ ${reason}\n\n<i>សូមនាយកសាលាពិនិត្យ និងអនុម័ត!</i>`;
          sendToTeachersChannel(msg).catch(e => console.error("Telegram admin notification error:", e));
        } catch (error: any) {
          console.error("Error saving leave request:", error);
          bot?.sendMessage(chatId, `❌ មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ៖ ${error.message || error}`);
        }
      } else {
        bot?.editMessageText(`❌ សំណើសុំច្បាប់ត្រូវបានបោះបង់។`, {
          chat_id: chatId,
          message_id: query.message?.message_id,
          parse_mode: 'HTML'
        });
      }
      
      await db.delete(telegramSessions).where(eq(telegramSessions.userId, userId));
      bot?.answerCallbackQuery(query.id);
    } else if (data.startsWith('schedule_day:')) {
      const dayCode = data.split(':')[1];
      
      const [student] = await db.select().from(students).where(eq(students.telegramChatId, chatId));
      const [teacher] = await db.select().from(teachers).where(eq(teachers.telegramChatId, chatId));
      
      if (!student && !teacher) {
        bot?.answerCallbackQuery(query.id, { text: '❌ សូមភ្ជាប់គណនីរបស់អ្នកជាមុនសិន។', show_alert: true });
        return;
      }

      const isStudent = !!student;
      
      let scheduleQuery;
      if (isStudent) {
        scheduleQuery = sql`
          SELECT 
              cs.id,
              cs.class_id,
              cs.subject_id,
              s.name_kh as subject_name_kh,
              s.name_en as subject_name_en,
              t.name_kh as teacher_name_kh,
              r.room_code,
              r.room_name_kh,
              wd.day_name_kh,
              wd.day_code,
              p.period_number,
              p.start_time,
              p.end_time
          FROM class_schedules cs
          JOIN subjects s ON cs.subject_id = s.id
          JOIN teachers t ON cs.teacher_id = t.id
          JOIN rooms r ON cs.room_id = r.id
          JOIN weekdays wd ON cs.weekday_id = wd.id
          JOIN periods p ON cs.period_id = p.id
          WHERE cs.class_id = ${student.classId}
          ORDER BY wd.display_order, p.period_number
        `;
      } else {
        scheduleQuery = sql`
          SELECT 
              cs.id,
              cs.class_id,
              cs.subject_id,
              s.name_kh as subject_name_kh,
              s.name_en as subject_name_en,
              c.name as class_name,
              r.room_code,
              r.room_name_kh,
              wd.day_name_kh,
              wd.day_code,
              p.period_number,
              p.start_time,
              p.end_time
          FROM class_schedules cs
          JOIN subjects s ON cs.subject_id = s.id
          JOIN classrooms c ON cs.class_id = c.id
          JOIN rooms r ON cs.room_id = r.id
          JOIN weekdays wd ON cs.weekday_id = wd.id
          JOIN periods p ON cs.period_id = p.id
          WHERE cs.teacher_id = ${teacher.id}
          ORDER BY wd.display_order, p.period_number
        `;
      }

      try {
        const result = await db.execute(scheduleQuery);
        let daySchedule = result.rows;
        if (dayCode !== 'ALL') {
          daySchedule = result.rows.filter((row: any) => row.day_code === dayCode);
        }
        
        const getDayNameKh = (code: string) => {
          const m: Record<string, string> = { MON: 'ចន្ទ', TUE: 'អង្គារ', WED: 'ពុធ', THU: 'ព្រហស្បតិ៍', FRI: 'សុក្រ', SAT: 'សៅរ៍' };
          return m[code] || code;
        };

        let message = '';
        if (dayCode !== 'ALL') {
          message = `📅 *កាលវិភាគថ្ងៃ ${getDayNameKh(dayCode)}*\n\n`;
          if (daySchedule.length === 0) {
             message += `មិនមានកាលវិភាគសិក្សាទេ សម្រាក! 🎉`;
          } else {
            for (const slot of daySchedule) {
              message += `${slot.period_number}. ${slot.start_time}-${slot.end_time}\n`;
              message += `   📖 ${slot.subject_name_kh}\n`;
              if (isStudent) message += `   👨‍🏫 ${slot.teacher_name_kh}\n`;
              else message += `   👥 ថ្នាក់ទី ${slot.class_name}\n`;
              message += `   🏠 ${slot.room_code}\n\n`;
            }
          }
        } else {
          message = "📅 *កាលវិភាគប្រចាំសប្តាហ៍*\n\n";
          const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
          for (const code of days) {
            const ds = result.rows.filter((s: any) => s.day_code === code);
            if (ds.length > 0) {
              message += `*${getDayNameKh(code)}:*\n`;
              for (const slot of ds.slice(0, 3)) {
                message += `   ${slot.period_number}. ${slot.subject_name_kh}\n`;
              }
              if (ds.length > 3) {
                message += `   ... និង ${ds.length - 3} មុខទៀត\n`;
              }
              message += "\n";
            }
          }
        }

        let replyMarkup = undefined;
        if (dayCode !== 'ALL') {
          const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
          const currIdx = days.indexOf(dayCode);
          if (currIdx !== -1 && currIdx < days.length - 1) {
            replyMarkup = {
              inline_keyboard: [[{ text: `បន្ទាប់: ${getDayNameKh(days[currIdx+1])} ➡️`, callback_data: `schedule_day:${days[currIdx+1]}` }]]
            };
          }
        }

        bot?.editMessageText(message, {
          chat_id: chatId,
          message_id: query.message?.message_id,
          parse_mode: 'Markdown',
          reply_markup: replyMarkup
        });
        bot?.answerCallbackQuery(query.id);
      } catch (err) {
        console.error("Schedule query error:", err);
        bot?.answerCallbackQuery(query.id, { text: 'មានបញ្ហាក្នុងការទាញយកកាលវិភាគ។', show_alert: true });
      }
    }
  });

  // Handle text input for wizard steps
  bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/') || !msg.from?.id) return;

    const userId = msg.from.id;
    const chatId = msg.chat.id;

    // Check if user has an active session expecting text input
    const session = await db.select().from(telegramSessions).where(eq(telegramSessions.userId, userId));
    if (session.length === 0) return;

    const currentSession = session[0];

    if (currentSession.command === '/leave' && currentSession.step === 'LEAVE_DURATION_CUSTOM') {
      const text = msg.text.trim();
      const duration = parseInt(text, 10);

      if (isNaN(duration) || duration <= 0) {
        bot?.sendMessage(chatId, '❌ ចំនួនថ្ងៃមិនត្រឹមត្រូវទេ។ សូមវាយបញ្ចូលចំនួនថ្ងៃជាលេខវិជ្ជមាន (ឧទាហរណ៍៖ ៥)៖');
        return;
      }

      const currentData = currentSession.data as any;
      
      const academicYear = getAcademicYear(currentData.startDate);
      let balance = await db.query.teacherLeaveBalances.findFirst({
        where: and(
          eq(teacherLeaveBalances.teacherId, currentData.teacherId),
          eq(teacherLeaveBalances.academicYear, academicYear)
        ),
      });
      const remainingDays = balance ? balance.remainingDays : 15;

      if (duration > remainingDays && currentData.type === 'ANNUAL') {
        bot?.sendMessage(chatId, `❌ មិនអាចសុំច្បាប់ <b>${duration} ថ្ងៃ</b> ទេ ព្រោះច្បាប់នៅសល់តែ <b>${remainingDays} ថ្ងៃ</b> ប៉ុណ្ណោះ។ សូមវាយបញ្ចូលចំនួនថ្ងៃតិចជាងនេះ៖`, { parse_mode: 'HTML' });
        return;
      }

      const endDate = new Date(currentData.startDate);
      endDate.setDate(endDate.getDate() + duration - 1);
      const endDateStr = endDate.toISOString().split('T')[0];

      await db.update(telegramSessions).set({
        step: 'LEAVE_REASON',
        data: { ...currentData, duration, endDate: endDateStr },
        updatedAt: new Date()
      }).where(eq(telegramSessions.userId, userId));

      const keyboard = {
        inline_keyboard: [
          [
            { text: '🤒 ឈឺ/សម្រាកព្យាបាល', callback_data: 'leave_reason:ឈឺ/សម្រាកព្យាបាល' },
          ],
          [
            { text: '👨‍👩‍👧 កិច្ចការគ្រួសារ', callback_data: 'leave_reason:កិច្ចការគ្រួសារ' },
          ],
          [
            { text: '📋 ធុរៈផ្ទាល់ខ្លួន', callback_data: 'leave_reason:ធុរៈផ្ទាល់ខ្លួន' },
          ],
          [
            { text: '📝 មូលហេតុផ្សេង...', callback_data: 'leave_reason:OTHER' },
          ]
        ]
      };

      bot?.sendMessage(chatId, `✅ បានជ្រើសរើសរយៈពេល: <b>${duration} ថ្ងៃ</b> (${currentData.startDate} → ${endDateStr})\n\nតើអ្វីជាមូលហេតុនៃការសុំច្បាប់?`, {
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      return;
    }

    if (currentSession.command === '/leave' && currentSession.step === 'LEAVE_REASON_TEXT') {
      const reason = msg.text.trim();
      const currentData = currentSession.data as any;

      if (reason.length < 3) {
        bot?.sendMessage(chatId, '❌ មូលហេតុខ្លីពេក។ សូមវាយបញ្ចូលម្តងទៀត៖');
        return;
      }

      await showLeaveConfirmation(chatId, userId, currentData, reason);
    }
  });
}

// ─── Helper: Show leave confirmation ─────────────────────────────────────
async function showLeaveConfirmation(chatId: number, userId: number, currentData: any, reason: string, editMessageId?: number) {
  await db.update(telegramSessions).set({
    step: 'LEAVE_CONFIRM',
    data: { ...currentData, reason },
    updatedAt: new Date()
  }).where(eq(telegramSessions.userId, userId));

  const summary = `📝 <b>សូមពិនិត្យមើលព័ត៌មានសុំច្បាប់៖</b>

━━━━━━━━━━━━━━━━━━━━
📋 ប្រភេទ៖ <b>${currentData.type}</b>
📅 ថ្ងៃចាប់ផ្តើម៖ <b>${currentData.startDate}</b>
⏱ ចំនួនថ្ងៃ៖ <b>${currentData.duration} ថ្ងៃ</b>
📅 ថ្ងៃបញ្ចប់៖ <b>${currentData.endDate}</b>
📝 មូលហេតុ៖ <b>${reason}</b>
━━━━━━━━━━━━━━━━━━━━

តើលោកគ្រូ/អ្នកគ្រូពិតជាចង់បញ្ជូនសំណើសុំច្បាប់នេះមែនទេ?`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ បញ្ជូនសំណើ (Submit)', callback_data: 'leave_confirm:yes' },
        { text: '❌ បោះបង់ (Cancel)', callback_data: 'leave_confirm:no' }
      ]
    ]
  };

  if (editMessageId) {
    bot?.editMessageText(summary, {
      chat_id: chatId,
      message_id: editMessageId,
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } else {
    bot?.sendMessage(chatId, summary, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  }
}

// ─── Grades Handler ──────────────────────────────────────────────────────
async function handleGradesCommand(chatId: number, studentCode: string) {
  try {
    console.log(`[DEBUG] Searching for student with code: ${studentCode}`);
    const studentList = await db.select().from(students).where(eq(students.studentId, studentCode));
    console.log(`[DEBUG] Found student: ${studentList.length}`);

    if (studentList.length === 0) {
      if (bot) {
        bot.sendMessage(chatId, `❌ រកមិនឃើញសិស្សដែលមានលេខសម្គាល់ <b>${studentCode}</b> ទេ។`, { parse_mode: 'HTML' });
      }
      return;
    }
    const student = studentList[0];

    const scores = await db.select().from(studentMonthlyScores).where(eq(studentMonthlyScores.studentId, student.id));
    console.log(`[DEBUG] Query result scores: ${scores.length}`);

    if (scores.length === 0) {
      const noScoreMsg = `📊 <b>របាយការណ៍ពិន្ទុ</b>\n👨‍🎓 ${student.nameKh} (${student.studentId})\n\n❌ មិនទាន់មានពិន្ទុនៅឡើយទេ។\n\nសូមទាក់ទងគ្រូប្រចាំថ្នាក់ ឬរដ្ឋបាលសាលារៀន។`;
      if (bot) bot.sendMessage(chatId, noScoreMsg, { parse_mode: 'HTML' });
      return;
    }

    const grouped: Record<string, { subject: string, score: number }[]> = {};
    for (const s of scores) {
      if (!grouped[s.month]) grouped[s.month] = [];
      grouped[s.month].push({ subject: s.subject, score: parseFloat(s.score as any) });
    }

    let reportMsg = `📊 <b>របាយការណ៍ពិន្ទុ</b>\n👨‍🎓 ${student.nameKh} (${student.studentId})\n`;
    for (const [month, monthScores] of Object.entries(grouped)) {
      reportMsg += `\n📅 <b>ប្រចាំខែ: ${month}</b>\n`;
      let total = 0;
      for (const s of monthScores) {
        reportMsg += `- ${s.subject}: ${s.score}\n`;
        total += s.score;
      }
      reportMsg += `📈 <b>សរុបរួម: ${total}</b>\n`;
    }

    if (bot) bot.sendMessage(chatId, reportMsg, { parse_mode: 'HTML' });
  } catch (error: any) {
    console.error("[Bot] /grades error:", error);
    if (bot) bot.sendMessage(chatId, `⚠️ មានបញ្ហាក្នុងការទាញយកទិន្នន័យពិន្ទុ។ សូមព្យាយាមម្តងទៀត។`);
  }
}

export function getBotInstance() {
  return bot;
}
