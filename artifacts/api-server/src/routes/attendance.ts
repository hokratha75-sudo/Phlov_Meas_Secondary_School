import { Router } from "express";
import { db, studentAttendance } from "@workspace/db";
import { eq, and, sql, like } from "drizzle-orm";
import { requireAuth } from "./auth";
import { sendToParentsChannel } from "../lib/telegram";

const router = Router();

/**
 * GET /api/attendance
 * Fetches attendance records for a classroom, date, shift, subject, and academic year.
 */
router.get("/attendance", requireAuth, async (req, res) => {
  const { classroomId, academicYear, date, shift, subject } = req.query;

  console.log(`[GET] /api/attendance - classroomId=${classroomId}, date=${date}, shift=${shift}, subject=${subject}`);

  try {
    if (!classroomId || !academicYear || !date || !shift || !subject) {
      res.status(400).json({ error: "Missing required query parameters" });
      return;
    }

    const records = await db.select().from(studentAttendance).where(
      and(
        eq(studentAttendance.classroomId, Number(classroomId)),
        eq(studentAttendance.academicYear, String(academicYear)),
        eq(studentAttendance.date, String(date)),
        eq(studentAttendance.shift, String(shift)),
        eq(studentAttendance.subject, String(subject))
      )
    );

    res.json({
      data: records.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString()
      })),
      total: records.length
    });
  } catch (error: any) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance records", details: error.message });
  }
});

/**
 * POST /api/attendance/bulk
 * Saves or updates a list of student attendance records for a classroom, date, shift, and subject.
 */
router.post("/attendance/bulk", requireAuth, async (req, res) => {
  const { classroomId, academicYear, date, shift, subject, records } = req.body;

  console.log(`[POST] /api/attendance/bulk - classroomId=${classroomId}, date=${date}, shift=${shift}, subject=${subject}, recordsCount=${records?.length}`);

  try {
    if (!classroomId || !academicYear || !date || !shift || !subject || !Array.isArray(records)) {
      res.status(400).json({ error: "Missing required fields or invalid records format" });
      return;
    }

    if (records.length === 0) {
      res.json({ message: "No records to save" });
      return;
    }

    // Insert or update all records in bulk
    await db.insert(studentAttendance)
      .values(
        records.map((r: any) => ({
          studentId: Number(r.studentId),
          classroomId: Number(classroomId),
          academicYear: String(academicYear),
          date: String(date),
          shift: String(shift),
          subject: String(subject),
          status: String(r.status),
          remarks: r.remarks ? String(r.remarks) : null,
          updatedAt: new Date()
        }))
      )
      .onConflictDoUpdate({
        target: [
          studentAttendance.studentId,
          studentAttendance.date,
          studentAttendance.shift,
          studentAttendance.subject
        ],
        set: {
          status: sql`EXCLUDED.status`,
          remarks: sql`EXCLUDED.remarks`,
          updatedAt: new Date()
        }
      });

    // --- TELEGRAM NOTIFICATION ---
    const unexcusedCount = records.filter((r: any) => r.status === "unexcused").length;
    if (unexcusedCount > 0) {
      const msg = `⚠️ <b>សេចក្តីជូនដំណឹងអំពីអវត្តមាន</b>\n\nកាលបរិច្ឆេទ៖ ${date}\nមុខវិជ្ជា៖ ${subject}\nវេន៖ ${shift}\n\nសិស្សអវត្តមានដោយគ្មានច្បាប់ចំនួន <b>${unexcusedCount}</b> នាក់។ សូមមាតាបិតាពិនិត្យមើលវត្តមានកូនៗលោកអ្នក!`;
      sendToParentsChannel(msg).catch(e => console.error("Telegram error:", e));
    }

    res.json({ message: "Attendance records saved successfully" });
  } catch (error: any) {
    console.error("CRITICAL ERROR: Failed to save attendance:", error);
    res.status(500).json({
      error: "Failed to save attendance records",
      details: error.message
    });
  }
});

const MONTH_MAP: Record<string, string> = {
  November: "-11-", December: "-12-", January: "-01-",
  February: "-02-", March: "-03-", April: "-04-",
  May: "-05-", June: "-06-", July: "-07-",
  August: "-08-", September: "-09-", October: "-10-"
};

/**
 * GET /api/attendance/absences
 * Fetches unexcused and excused absences summary for all students in a classroom for a specific month or semester.
 */
router.get("/attendance/absences", requireAuth, async (req, res) => {
  const { classroomId, academicYear, month } = req.query;

  console.log(`[GET] /api/attendance/absences - classroomId=${classroomId}, month=${month}`);

  try {
    if (!classroomId || !academicYear || !month) {
      res.status(400).json({ error: "Missing required query parameters" });
      return;
    }

    const pattern = MONTH_MAP[String(month)];
    if (!pattern) {
      // Semester query
      let patterns: string[] = [];
      if (String(month) === "Semester 1") {
        patterns = ["-11-", "-12-", "-01-", "-02-", "-03-"];
      } else if (String(month) === "Semester 2") {
        patterns = ["-05-", "-06-", "-07-", "-08-", "-09-"];
      } else {
        patterns = ["-"];
      }

      const records = await db.select().from(studentAttendance).where(
        and(
          eq(studentAttendance.classroomId, Number(classroomId)),
          eq(studentAttendance.academicYear, String(academicYear))
        )
      );

      const aggregated: Record<number, { excused: number, unexcused: number }> = {};
      records.forEach(r => {
        const matchesSemester = patterns.some(pat => r.date.includes(pat));
        if (matchesSemester) {
          if (!aggregated[r.studentId]) {
            aggregated[r.studentId] = { excused: 0, unexcused: 0 };
          }
          if (r.status === "excused") aggregated[r.studentId].excused++;
          if (r.status === "unexcused") aggregated[r.studentId].unexcused++;
        }
      });

      res.json({ data: aggregated, records });
      return;
    }

    // Standard monthly query using LIKE operator for month pattern matching
    const records = await db.select().from(studentAttendance).where(
      and(
        eq(studentAttendance.classroomId, Number(classroomId)),
        eq(studentAttendance.academicYear, String(academicYear)),
        like(studentAttendance.date, `%${pattern}%`)
      )
    );

    const aggregated: Record<number, { excused: number, unexcused: number }> = {};
    records.forEach(r => {
      if (!aggregated[r.studentId]) {
        aggregated[r.studentId] = { excused: 0, unexcused: 0 };
      }
      if (r.status === "excused") aggregated[r.studentId].excused++;
      if (r.status === "unexcused") aggregated[r.studentId].unexcused++;
    });

    res.json({ data: aggregated, records });
  } catch (error: any) {
    console.error("Error fetching absences summary:", error);
    res.status(500).json({ error: "Failed to fetch absences summary", details: error.message });
  }
});

export default router;
