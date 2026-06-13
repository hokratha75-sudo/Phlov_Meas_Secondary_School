import { Router } from "express";
import { db, studentMonthlyScores, students } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "./auth";
import { sendToStudentsChannel, sendToParentsChannel } from "../lib/telegram";

const router = Router();

/**
 * GET /api/grades
 * Fetches granular scores from studentMonthlyScores and aggregates them 
 * into a per-student object for the frontend spreadsheet.
 */
router.get("/", requireAuth, async (req, res) => {
  const { classroomId, academicYear, examPeriod } = req.query;

  try {
    if (!classroomId || !academicYear || !examPeriod) {
      return res.status(400).json({ error: "Missing required query parameters" });
    }

    // Fetch all granular scores for this classroom/month
    const rawScores = await db.select().from(studentMonthlyScores).where(
      and(
        eq(studentMonthlyScores.classId, Number(classroomId)),
        eq(studentMonthlyScores.academicYear, String(academicYear)),
        eq(studentMonthlyScores.month, String(examPeriod))
      )
    );

    // Group scores by studentId
    const aggregated: Record<number, any> = {};
    
    rawScores.forEach(row => {
      if (!aggregated[row.studentId]) {
        aggregated[row.studentId] = {
          studentId: row.studentId,
          scores: {},
          updatedAt: row.updatedAt
        };
      }
      aggregated[row.studentId].scores[row.subject] = parseFloat(row.score.toString());
    });

    res.json({
      data: Object.values(aggregated),
      total: Object.keys(aggregated).length,
    });
    return;
  } catch (error) {
    console.error("Error fetching grades:", error);
    res.status(500).json({ error: "Failed to fetch grades" });
    return;
  }
});

/**
 * POST /api/grades/save
 * Granular UPSERT for a single score.
 * This is the "Server Action" equivalent.
 */
router.post("/save", requireAuth, async (req, res) => {
  const { studentId, classId, academicYear, month, subject, score } = req.body;

  if (!studentId || !classId || !academicYear || !month || !subject) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const sId = Number(studentId);
    const cId = Number(classId);
    const scoreVal = parseFloat(score.toString()) || 0;

    // Drizzle UPSERT logic using onConflictDoUpdate
    await db.insert(studentMonthlyScores)
      .values({
        studentId: sId,
        classId: cId,
        academicYear: String(academicYear),
        month: String(month),
        subject: String(subject),
        score: scoreVal.toString(),
      })
      .onConflictDoUpdate({
        target: [
          studentMonthlyScores.studentId, 
          studentMonthlyScores.academicYear, 
          studentMonthlyScores.month, 
          studentMonthlyScores.subject
        ],
        set: {
          score: scoreVal.toString(),
          updatedAt: new Date(),
        },
      });

    res.json({ message: "Score saved successfully" });
    return;
  } catch (error) {
    console.error("CRITICAL ERROR: Failed to save score:", error);
    res.status(500).json({ 
      error: "Failed to save score", 
      details: error instanceof Error ? error.message : String(error) 
    });
    return;
  }
});

/**
 * POST /api/grades
 * Legacy bulk update (keeping it just in case, but redirecting to save logic)
 */
router.post("/", requireAuth, async (req, res) => {
  const { classroomId, academicYear, examPeriod, grades } = req.body;
  // This could be updated to loop through and call the upsert logic for each entry
  res.status(501).json({ error: "Use /api/grades/save for auto-save logic" });
});

/**
 * POST /api/grades/publish
 * Trigger a Telegram notification that grades have been published.
 */
router.post("/publish", requireAuth, async (req, res) => {
  const { classroomId, academicYear, month, subject } = req.body;
  if (!classroomId || !academicYear || !month || !subject) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const msg = `📊 <b>លទ្ធផលសិក្សាបានចេញហើយ!</b>\n\nមុខវិជ្ជា៖ <b>${subject}</b>\nប្រចាំខែ៖ <b>${month}</b>\n\nសូមសិស្សានុសិស្ស និងមាតាបិតាចូលពិនិត្យមើលពិន្ទុតាមរយៈប្រព័ន្ធសាលា ឬតាម Telegram Bot!`;
  
  // Fire and forget
  Promise.all([
    sendToStudentsChannel(msg),
    sendToParentsChannel(msg)
  ]).catch(e => console.error("Telegram publish error:", e));

  res.json({ message: "Grades published notification sent." });
  return;
});

export default router;
