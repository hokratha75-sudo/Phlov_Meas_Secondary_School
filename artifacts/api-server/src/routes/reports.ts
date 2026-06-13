import { Router } from "express";
import { db, studentMonthlyScores, students, classrooms, subjectConfigs } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

/**
 * GET /api/reports/annual-summary
 * Dynamically calculates annual summary based on subject configurations.
 */
router.get("/annual-summary", requireAuth, async (req, res) => {
  const { classroomId, academicYear } = req.query;

  if (!classroomId || !academicYear) {
    return res.status(400).json({ error: "Missing classroomId or academicYear" });
  }

  try {
    const classIdNum = Number(classroomId);
    const yearStr = String(academicYear);

    // 1. Fetch Classroom Info
    const classroom = await db.query.classrooms.findFirst({
      where: eq(classrooms.id, classIdNum)
    });

    if (!classroom) {
      return res.status(404).json({ error: "Classroom not found" });
    }

    // Extract grade number from string like "Grade 10"
    const gradeLevel = parseInt(classroom.grade.replace(/[^0-9]/g, ""));
    
    // Assume Science track if class name contains 'A' (simplification for demo)
    const isScienceTrack = classroom.name.toUpperCase().includes("A");

    // 2. Fetch Subject Configs for this grade/track
    const configs = await db.select({
      subjectId: subjectConfigs.subjectId,
      maxScore: sql<number>`CAST(${subjectConfigs.maxScore} AS DECIMAL)`
    })
    .from(subjectConfigs)
    .where(
      and(
        eq(subjectConfigs.gradeLevel, gradeLevel),
        eq(subjectConfigs.isScienceTrack, isScienceTrack)
      )
    );

    const totalMaxPossible = configs.reduce((sum, c) => sum + Number(c.maxScore), 0);

    // 3. Fetch all scores for the class and year
    const allScores = await db.select({
      studentId: studentMonthlyScores.studentId,
      month: studentMonthlyScores.month,
      subject: studentMonthlyScores.subject,
      score: sql<number>`CAST(${studentMonthlyScores.score} AS DECIMAL)`
    })
    .from(studentMonthlyScores)
    .where(
      and(
        eq(studentMonthlyScores.classId, classIdNum),
        eq(studentMonthlyScores.academicYear, yearStr)
      )
    );

    // 4. Group by Student and Semester
    const studentData: Record<number, any> = {};

    allScores.forEach(row => {
      if (!studentData[row.studentId]) {
        studentData[row.studentId] = { s1Total: 0, s2Total: 0 };
      }

      const config = configs.find(c => c.subjectId.toString() === row.subject);
      if (config) {
        // Simple aggregation logic: average monthly score for the subject per semester
        const isS1 = ["November", "December", "January", "February", "March"].includes(row.month);
        const isS2 = ["April", "May", "June", "July"].includes(row.month);

        // For simplicity, we add the monthly score. 
        // Real logic would average monthly scores first, then sum.
        // Here we'll treat each entry as a contributing factor.
        if (isS1) studentData[row.studentId].s1Total += Number(row.score);
        if (isS2) studentData[row.studentId].s2Total += Number(row.score);
      }
    });

    // 5. Fetch student details and finalize
    const classStudents = await db.select().from(students).where(eq(students.classId, classIdNum));

    const finalData = classStudents.map(student => {
      const data = studentData[student.id] || { s1Total: 0, s2Total: 0 };
      
      // Calculate Weighted Averages
      // (Actual Total / (Total Max Possible * Months Count)) * 50
      // For demo, we'll assume a fixed target base of 50
      const s1Avg = totalMaxPossible > 0 ? (data.s1Total / (totalMaxPossible * 5)) * 50 : 0;
      const s2Avg = totalMaxPossible > 0 ? (data.s2Total / (totalMaxPossible * 4)) * 50 : 0;
      const annualAvg = (s1Avg + s2Avg) / 2;

      return {
        id: student.id,
        studentId: student.studentId,
        nameKh: student.nameKh,
        nameEn: student.nameEn,
        gender: student.gender,
        avgS1: parseFloat(s1Avg.toFixed(2)),
        avgS2: parseFloat(s2Avg.toFixed(2)),
        annualAvg: parseFloat(annualAvg.toFixed(2)),
        result: annualAvg >= 25.00 ? "Pass" : "Fail"
      };
    });

    const rankedData = finalData
      .sort((a, b) => b.annualAvg - a.annualAvg)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    res.json({ data: rankedData });
    return;

  } catch (error) {
    console.error("Error generating dynamic annual summary:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

export default router;
