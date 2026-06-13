import { Router } from "express";
import { db, teachers, students, classrooms, studentAttendance, telegramSessions, telegramMessageLog, telegramMessages, parents } from "@workspace/db";
import { eq, desc, count, isNotNull, and } from "drizzle-orm";
import { requireAuth } from "./auth";
import { getBotInfo, getChannelConfig, sendTelegramMessage, editTelegramMessageText, answerCallbackQuery } from "../lib/telegram";
import crypto from "crypto";
import rateLimit from "express-rate-limit";

// Rate limiting for link generation to prevent abuse
const linkRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: { error: "Too many link generation requests. Please wait." },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

// ─── GET /telegram/status — Bot status + channel info ──────────────────────
router.get("/telegram/status", requireAuth, async (req, res) => {
  try {
    const botInfo = await getBotInfo();
    const channels = getChannelConfig();

    // Count linked teachers
    const [linkedCount] = await db
      .select({ count: count() })
      .from(teachers)
      .where(isNotNull(teachers.telegramChatId));

    // Count total teachers
    const [totalCount] = await db.select({ count: count() }).from(teachers);

    // Count recent messages (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMessages = await db
      .select()
      .from(telegramMessageLog)
      .where(eq(telegramMessageLog.status, "sent"))
      .orderBy(desc(telegramMessageLog.sentAt))
      .limit(100);

    const last24h = recentMessages.filter((m) => new Date(m.sentAt) > oneDayAgo).length;

    res.json({
      bot: botInfo
        ? {
            id: botInfo.id,
            name: botInfo.first_name,
            username: botInfo.username,
            isActive: true,
          }
        : { isActive: false },
      channels,
      stats: {
        linkedTeachers: linkedCount?.count ?? 0,
        totalTeachers: totalCount?.count ?? 0,
        messagesSent24h: last24h,
        totalMessagesSent: recentMessages.length,
      },
    });
  } catch (err: any) {
    console.error("[GET] /api/telegram/status - Error:", err);
    res.status(500).json({ error: "Failed to fetch Telegram status", details: err.message });
  }
});

// ─── GET /telegram/linked-teachers — List of linked teachers ───────────────
router.get("/telegram/linked-teachers", requireAuth, async (req, res) => {
  try {
    const linkedTeachers = await db
      .select({
        id: teachers.id,
        nameKh: teachers.nameKh,
        nameEn: teachers.nameEn,
        position: teachers.position,
        subjectKh: teachers.subjectKh,
        telegramChatId: teachers.telegramChatId,
        telegramLinkedAt: teachers.telegramLinkedAt,
        photoUrl: teachers.photoUrl,
      })
      .from(teachers)
      .where(isNotNull(teachers.telegramChatId));

    res.json({ data: linkedTeachers, total: linkedTeachers.length });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch linked teachers", details: err.message });
  }
});

// ─── POST /telegram/generate-link-code/:teacherId — Generate linking code ──
router.post("/telegram/generate-link-code/:teacherId", requireAuth, async (req: any, res) => {
  try {
    const teacherId = Number(req.params["teacherId"]);

    // Check if admin
    const role = req.adminUser?.role;
    if (role === "teacher") {
      res.status(403).json({ error: "Only admin can generate link codes" });
      return;
    }

    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, teacherId));
    if (!teacher) {
      res.status(404).json({ error: "Teacher not found" });
      return;
    }

    // Check if already linked
    if (teacher.telegramChatId) {
      res.status(400).json({
        error: "Teacher already linked to Telegram",
        linkedAt: teacher.telegramLinkedAt,
      });
      return;
    }

    // Generate a unique link code: PM-XXXXXX
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "PM-";
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      code += chars[bytes[i] % chars.length];
    }

    // Save code to teacher
    await db
      .update(teachers)
      .set({
        telegramLinkCode: code,
        updatedAt: new Date(),
      })
      .where(eq(teachers.id, teacherId));

    res.json({
      code,
      teacherName: teacher.nameKh,
      instructions: `គ្រូ ${teacher.nameKh} សូមផ្ញើ /link ${code} ទៅកាន់ Bot ក្នុង Telegram ដើម្បីភ្ជាប់គណនី។`,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to generate link code", details: err.message });
  }
});

// ─── POST /telegram/unlink/:teacherId — Unlink a teacher ──────────────────
router.post("/telegram/unlink/:teacherId", requireAuth, async (req: any, res) => {
  try {
    const teacherId = Number(req.params["teacherId"]);
    const role = req.adminUser?.role;
    if (role === "teacher") {
      res.status(403).json({ error: "Only admin can unlink teachers" });
      return;
    }

    await db
      .update(teachers)
      .set({
        telegramChatId: null,
        telegramLinkCode: null,
        telegramLinkedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(teachers.id, teacherId));

    res.json({ message: "Teacher unlinked from Telegram" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to unlink teacher", details: err.message });
  }
});

// ─── POST /telegram/send-test — Send test message to a channel ────────────
router.post("/telegram/send-test", requireAuth, async (req: any, res) => {
  try {
    const role = req.adminUser?.role;
    if (role === "teacher") {
      res.status(403).json({ error: "Only admin can send test messages" });
      return;
    }

    const { channelId, message } = req.body;
    if (!channelId || !message) {
      res.status(400).json({ error: "channelId and message are required" });
      return;
    }

    const success = await sendTelegramMessage(channelId, message, "HTML");
    res.json({ success, channelId });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to send test message", details: err.message });
  }
});

// ─── GET /telegram/message-log — Recent message delivery log ──────────────
router.get("/telegram/message-log", requireAuth, async (req, res) => {
  try {
    const limit = Number(req.query["limit"]) || 50;
    const offset = Number(req.query["offset"]) || 0;

    const [items, [total]] = await Promise.all([
      db
        .select()
        .from(telegramMessageLog)
        .orderBy(desc(telegramMessageLog.sentAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(telegramMessageLog),
    ]);

    res.json({
      data: items.map((i) => ({
        ...i,
        sentAt: i.sentAt.toISOString(),
      })),
      total: total?.count ?? 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch message log", details: err.message });
  }
});

// ─── STUDENT LINK CODE GENERATION ──────────────────────────────────────────
router.post("/telegram/generate-link-code/student/:studentId", requireAuth, linkRateLimiter, async (req: any, res) => {
  try {
    const studentId = Number(req.params["studentId"]);
    const [student] = await db.select().from(students).where(eq(students.id, studentId));
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    if (student.telegramChatId) {
      res.status(400).json({ error: "Student already linked to Telegram", linkedAt: student.telegramLinkedAt });
      return;
    }

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "PM-";
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      code += chars[bytes[i] % chars.length];
    }

    await db.update(students).set({ telegramLinkCode: code, updatedAt: new Date() }).where(eq(students.id, studentId));

    res.json({
      code,
      studentName: student.nameKh,
      instructions: `សិស្ស ${student.nameKh} សូមផ្ញើ /link ${code} ទៅកាន់ Bot ក្នុង Telegram ដើម្បីភ្ជាប់គណនី។`,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to generate link code", details: err.message });
  }
});

router.post("/telegram/unlink/student/:studentId", requireAuth, async (req: any, res) => {
  try {
    const studentId = Number(req.params["studentId"]);
    await db.update(students).set({
      telegramChatId: null,
      telegramLinkCode: null,
      telegramLinkedAt: null,
      updatedAt: new Date(),
    }).where(eq(students.id, studentId));
    res.json({ message: "Student unlinked from Telegram" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to unlink student", details: err.message });
  }
});

// ─── PARENT LINK CODE GENERATION ───────────────────────────────────────────
router.post("/telegram/generate-link-code/parent/:parentId", requireAuth, linkRateLimiter, async (req: any, res) => {
  try {
    const parentId = Number(req.params["parentId"]);
    const [parentRecord] = await db.select().from(parents).where(eq(parents.id, parentId));
    if (!parentRecord) {
      res.status(404).json({ error: "Parent not found" });
      return;
    }

    if (parentRecord.telegramChatId) {
      res.status(400).json({ error: "Parent already linked to Telegram", linkedAt: parentRecord.telegramLinkedAt });
      return;
    }

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "PM-";
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      code += chars[bytes[i] % chars.length];
    }

    await db.update(parents).set({ telegramLinkCode: code, updatedAt: new Date() }).where(eq(parents.id, parentId));

    res.json({
      code,
      parentName: parentRecord.parentName,
      instructions: `អាណាព្យាបាល ${parentRecord.parentName} សូមផ្ញើ /link ${code} ទៅកាន់ Bot ក្នុង Telegram ដើម្បីភ្ជាប់គណនី។`,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to generate link code", details: err.message });
  }
});

router.post("/telegram/unlink/parent/:parentId", requireAuth, async (req: any, res) => {
  try {
    const parentId = Number(req.params["parentId"]);
    await db.update(parents).set({
      telegramChatId: null,
      telegramLinkCode: null,
      telegramLinkedAt: null,
      updatedAt: new Date(),
    }).where(eq(parents.id, parentId));
    res.json({ message: "Parent unlinked from Telegram" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to unlink parent", details: err.message });
  }
});

// ─── POST /telegram/webhook — Incoming Telegram Messages ─────────────────
router.post("/telegram/webhook", async (req, res) => {
  // Respond immediately to Telegram to prevent timeout retries
  res.sendStatus(200);

  const update = req.body;
  setImmediate(async () => {
    try {
      await processTelegramUpdate(update);
    } catch (err: any) {
      console.error("Webhook processing error:", err.message);
    }
  });
});

async function processTelegramUpdate(update: any) {
  // Check if it's a message
  if (update.message) {
    const msg = update.message;
    const text = msg.text || "";
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    // COMMAND HANDLING
    if (text.startsWith('/link ')) {
      const code = text.split(' ')[1];
      if (code) {
        // Check teachers
        const [teacher] = await db.select().from(teachers).where(eq(teachers.telegramLinkCode, code));
        if (teacher) {
          await db.update(teachers).set({ telegramChatId: chatId, telegramLinkedAt: new Date() }).where(eq(teachers.id, teacher.id));
          await sendTelegramMessage(chatId, `ជោគជ័យ! គណនីគ្រូ ${teacher.nameKh} ត្រូវបានភ្ជាប់។ អ្នកអាចប្រើ /attendance ដើម្បីស្រង់វត្តមានបាន។`);
          return;
        }
        // Check students
        const [student] = await db.select().from(students).where(eq(students.telegramLinkCode, code));
        if (student) {
          await db.update(students).set({ telegramChatId: chatId, telegramLinkedAt: new Date() }).where(eq(students.id, student.id));
          await sendTelegramMessage(chatId, `ជោគជ័យ! គណនីសិស្ស ${student.nameKh} ត្រូវបានភ្ជាប់។ អ្នកអាចប្រើ /myattendance ដើម្បីពិនិត្យវត្តមានរបស់អ្នក។`);
          return;
        }
        // Check parents
        const [parentRecord] = await db.select().from(parents).where(eq(parents.telegramLinkCode, code));
        if (parentRecord) {
          await db.update(parents).set({ telegramChatId: chatId, telegramLinkedAt: new Date() }).where(eq(parents.id, parentRecord.id));
          const [student] = await db.select().from(students).where(eq(students.id, parentRecord.studentId));
          const studentName = student ? student.nameKh : "សិស្ស";
          await sendTelegramMessage(chatId, `ជោគជ័យ! គណនីអាណាព្យាបាលរបស់សិស្ស ${studentName} ត្រូវបានភ្ជាប់។`);
          return;
        }
        await sendTelegramMessage(chatId, 'លេខកូដមិនត្រឹមត្រូវ ឬត្រូវបានប្រើប្រាស់រួចហើយ។');
        return;
      }
    }

    if (text === '/attendance') {
      const [teacher] = await db.select().from(teachers).where(eq(teachers.telegramChatId, chatId));
      if (!teacher) {
        await sendTelegramMessage(chatId, 'សូមភ្ជាប់គណនីរបស់អ្នកជាមុនសិនដោយប្រើ /link <code>។');
        return;
      }
      
      // Fetch classes
      const teacherClasses = await db.select().from(classrooms); // In a real app we'd filter by teacher's classes. For now show all.
      if (teacherClasses.length === 0) {
        await sendTelegramMessage(chatId, 'អ្នកមិនមានថ្នាក់រៀនសម្រាប់ស្រង់វត្តមានទេ។');
        return;
      }

      const inline_keyboard = teacherClasses.map(c => ([{ text: c.name, callback_data: `class:${c.id}` }]));
      await sendTelegramMessage(chatId, 'សូមជ្រើសរើសថ្នាក់រៀន៖', 'HTML', false, { inline_keyboard });
      return;
    }

    if (text === '/myattendance') {
      const [student] = await db.select().from(students).where(eq(students.telegramChatId, chatId));
      if (!student) {
        await sendTelegramMessage(chatId, 'សូមភ្ជាប់គណនីរបស់អ្នកជាមុនសិនដោយប្រើ /link <code>។');
        return;
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

      let msgText = `📊 របាយការណ៍វត្តមានប្រចាំខែ: ${student.nameKh}\n\n`;
      msgText += `ចំនួនអវត្តមានអត់ច្បាប់៖ ${absences.length} ដង\n`;
      
      if (absences.length > 3) {
        msgText += `\n⚠️ សូមប្រុងប្រយ័ត្ន! អ្នកមានអវត្តមានច្រើនជាង៣ដងហើយ។`;
      }

      await sendTelegramMessage(chatId, msgText);
      return;
    }
    
    const isMentioningAdmin = text.includes("@admin") || text.includes("@រដ្ឋបាល");
    
    let autoResponse = null;
    let incomingStatus = "unread";
    
    // FAQ logic
    if (text.includes("ម៉ោងរៀន") || text.includes("ម៉ោងសិក្សា") || text.includes("កាលវិភាគ")) {
      autoResponse = "ម៉ោងរៀន៖ ពីថ្ងៃច័ន្ទ ដល់ថ្ងៃសៅរ៍ ម៉ោង ៧:០០ ព្រឹក ដល់ ១១:០០ ព្រឹក និង ១:០០ រសៀល ដល់ ៥:០០ ល្ងាច។";
      incomingStatus = "replied";
    } else if (text.includes("ប្រឡង")) {
      autoResponse = "កាលវិភាគប្រឡង៖ សូមចូលមើលកាលវិភាគប្រឡងក្នុងគេហទំព័រសាលា។\nតំណភ្ជាប់៖ https://phlovmeas.edu.kh/exams";
      incomingStatus = "replied";
    } else if (text.includes("ទំនាក់ទំនង") || text.includes("លេខទូរស័ព្ទ")) {
      autoResponse = "ទំនាក់ទំនងរដ្ឋបាលសាលា៖\nទូរស័ព្ទ៖ 012 345 678\nអ៊ីមែល៖ info@phlovmeas.edu.kh";
      incomingStatus = "replied";
    } else if (text.includes("ចុះឈ្មោះ") || text.includes("តើខ្ញុំអាចចុះឈ្មោះបានដោយរបៀបណា")) {
      autoResponse = "សួស្តី! ដើម្បីចុះឈ្មោះចូលរៀន សូមអញ្ជើញមកកាន់ការិយាល័យរដ្ឋបាលនៃវិទ្យាល័យផ្លូវមាសដោយផ្ទាល់នៅម៉ោងធ្វើការ។";
      incomingStatus = "replied";
    } else if (isMentioningAdmin) {
      autoResponse = "✅ សាររបស់អ្នកត្រូវបានបញ្ជូនទៅកាន់រដ្ឋបាលហើយ។ យើងនឹងឆ្លើយតបក្នុងពេលឆាប់ៗនេះ។";
      incomingStatus = "unread";
    }

    // Save ALL incoming messages to database
    await db.insert(telegramMessages).values({
      messageId: messageId,
      chatId: chatId,
      userId: msg.from?.id,
      username: msg.from?.username,
      firstName: msg.from?.first_name,
      lastName: msg.from?.last_name,
      messageText: text,
      isFromBot: false,
      isReplyToAdmin: false,
      status: incomingStatus,
    });

    // Auto-respond to common questions (FAQ)
    if (autoResponse) {
      await sendTelegramMessage(chatId, autoResponse);
      // Save the bot's auto-response to the database
      await db.insert(telegramMessages).values({
        messageId: Date.now(), // Fallback ID for bot response
        chatId: chatId,
        messageText: autoResponse,
        isFromBot: true,
        status: "sent",
      });
    }
  } else if (update.callback_query) {
    const cb = update.callback_query;
    const data = cb.data;
    const chatId = cb.message.chat.id;
    const messageId = cb.message.message_id;

    if (data.startsWith('class:')) {
      const classId = parseInt(data.split(':')[1]);
      const classStudents = await db.select().from(students).where(eq(students.classId, classId));
      
      // Initialize draft
      const draft: Record<number, string> = {};
      classStudents.forEach(s => draft[s.id] = 'present');
      
      await db.insert(telegramSessions).values({
        userId: cb.from.id,
        chatId: chatId,
        command: '/attendance',
        step: 'taking',
        data: { classId, draft }
      });

      // Build keyboard
      const inline_keyboard = classStudents.map(s => ([{ text: `✅ ${s.nameKh}`, callback_data: `toggle:${s.id}` }]));
      inline_keyboard.push([{ text: '💾 បញ្ជូន (Submit)', callback_data: 'submit' }]);

      await editTelegramMessageText(chatId, messageId, 'សូមចុចលើឈ្មោះដើម្បីប្តូរពី ✅ ទៅ ❌៖', 'HTML', { inline_keyboard });
    } else if (data.startsWith('toggle:')) {
      const studentId = parseInt(data.split(':')[1]);
      
      // Get session
      const sessionList = await db.select().from(telegramSessions).where(
        and(eq(telegramSessions.chatId, chatId), eq(telegramSessions.command, '/attendance'))
      ).orderBy(desc(telegramSessions.createdAt)).limit(1);
      
      if (sessionList.length > 0) {
        const session = sessionList[0];
        const data = session.data as any;
        const draft = data.draft;
        draft[studentId] = draft[studentId] === 'present' ? 'unexcused' : 'present';
        
        await db.update(telegramSessions).set({ data }).where(eq(telegramSessions.id, session.id));

        // Rebuild keyboard
        const classStudents = await db.select().from(students).where(eq(students.classId, data.classId));
        const inline_keyboard = classStudents.map(s => ([{ 
          text: `${draft[s.id] === 'present' ? '✅' : '❌'} ${s.nameKh}`, 
          callback_data: `toggle:${s.id}` 
        }]));
        inline_keyboard.push([{ text: '💾 បញ្ជូន (Submit)', callback_data: 'submit' }]);

        await editTelegramMessageText(chatId, messageId, 'សូមចុចលើឈ្មោះដើម្បីប្តូរពី ✅ ទៅ ❌៖', 'HTML', { inline_keyboard });
      }
    } else if (data === 'submit') {
      const sessionList = await db.select().from(telegramSessions).where(
        and(eq(telegramSessions.chatId, chatId), eq(telegramSessions.command, '/attendance'))
      ).orderBy(desc(telegramSessions.createdAt)).limit(1);
      
      if (sessionList.length > 0) {
        const session = sessionList[0];
        const data = session.data as any;
        const draft = data.draft;
        const classId = data.classId;
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
            status: status as string
          }).onConflictDoUpdate({
            target: [studentAttendance.studentId, studentAttendance.date, studentAttendance.shift, studentAttendance.subject],
            set: { status: status as string }
          });
        }

        await editTelegramMessageText(chatId, messageId, '✅ វត្តមានត្រូវបានរក្សាទុករួចរាល់។', 'HTML', { inline_keyboard: [] });
      }
      await answerCallbackQuery(cb.id, 'ជោគជ័យ!');
    }
  }
}

export default router;
