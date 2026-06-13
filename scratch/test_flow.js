const { db, telegramSessions, teacherLeaves } = require('@workspace/db');
const { eq } = require('drizzle-orm');

async function main() {
  const userId = 123456789;
  const chatId = 123456789;
  const teacherId = 3;

  console.log('1. Starting /leave command simulation');
  // Clear any existing
  await db.delete(telegramSessions).where(eq(telegramSessions.userId, userId));

  // Insert session
  await db.insert(telegramSessions).values({
    userId,
    chatId,
    command: '/leave',
    step: 'LEAVE_TYPE',
    data: { teacherId }
  });

  // Step 2: leave_type:SICK_LEAVE
  console.log('2. Simulating leave_type:SICK_LEAVE');
  let session = await db.select().from(telegramSessions).where(eq(telegramSessions.userId, userId));
  let currentData = session[0].data;
  console.log('Current Data in session:', currentData);
  
  await db.update(telegramSessions).set({
    step: 'LEAVE_DATE',
    data: { ...currentData, type: 'SICK_LEAVE' },
    updatedAt: new Date()
  }).where(eq(telegramSessions.userId, userId));

  // Step 3: leave_date:today (let's assume 2026-06-09)
  console.log('3. Simulating leave_date:today');
  session = await db.select().from(telegramSessions).where(eq(telegramSessions.userId, userId));
  currentData = session[0].data;
  
  await db.update(telegramSessions).set({
    step: 'LEAVE_DURATION',
    data: { ...currentData, startDate: '2026-06-09' },
    updatedAt: new Date()
  }).where(eq(telegramSessions.userId, userId));

  // Step 4: leave_duration:2
  console.log('4. Simulating leave_duration:2');
  session = await db.select().from(telegramSessions).where(eq(telegramSessions.userId, userId));
  currentData = session[0].data;
  
  const duration = 2;
  const endDate = '2026-06-10';
  await db.update(telegramSessions).set({
    step: 'LEAVE_REASON',
    data: { ...currentData, duration, endDate },
    updatedAt: new Date()
  }).where(eq(telegramSessions.userId, userId));

  // Step 5: leave_reason:ឈឺ/សម្រាកព្យាបាល
  console.log('5. Simulating leave_reason:ឈឺ/សម្រាកព្យាបាល');
  session = await db.select().from(telegramSessions).where(eq(telegramSessions.userId, userId));
  currentData = session[0].data;
  
  await db.update(telegramSessions).set({
    step: 'LEAVE_CONFIRM',
    data: { ...currentData, reason: 'ឈឺ/សម្រាកព្យាបាល' },
    updatedAt: new Date()
  }).where(eq(telegramSessions.userId, userId));

  // Step 6: leave_confirm:yes
  console.log('6. Simulating leave_confirm:yes');
  session = await db.select().from(telegramSessions).where(eq(telegramSessions.userId, userId));
  currentData = session[0].data;
  console.log('Final Data before insert:', currentData);

  try {
    const leaveType = currentData.type;
    const startDate = currentData.startDate;
    const endDate = currentData.endDate;
    const totalDaysNum = Number(currentData.duration);
    const reason = currentData.reason || "ស្នើសុំតាម Telegram Bot";
    const addressDuringLeave = "មិនបញ្ជាក់";

    console.log('Inserting into teacher_leaves...');
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
    console.log('Insert Success! Item ID:', item.id);

    // Cleanup
    await db.delete(teacherLeaves).where(eq(teacherLeaves.id, item.id));
    console.log('Cleanup leaves success.');
  } catch (err) {
    console.error('Insert Failed:', err);
  }

  // Cleanup session
  await db.delete(telegramSessions).where(eq(telegramSessions.userId, userId));
  console.log('Cleanup session success.');
}

main().catch(console.error);
