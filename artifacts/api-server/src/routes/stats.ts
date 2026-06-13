import { Router } from "express";
import { db, news, activities, teachers, students, contactMessages, classrooms, subjects } from "@workspace/db";
import { eq, count, and } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

/**
 * GET /api/stats
 * Returns all 6 dashboard aggregate metrics using efficient SQL COUNT queries.
 * Queries run concurrently via Promise.all() for maximum speed.
 */
router.get("/stats", requireAuth, async (_req, res) => {
  console.log("[GET] /api/stats - Calculating dashboard statistics...");
  try {
    // Determine the current academic year (Cambodian school year runs ~Nov to Aug)
    const now = new Date();
    const currentYear = now.getFullYear();
    const academicEnrollmentYear = now.getMonth() < 8 ? currentYear - 1 : currentYear;

    const [
      [totalStudents],
      [totalTeachers],
      [totalClasses],
      [totalSubjects],
      [newStudents],
      [droppedStudents],
      // Legacy counts kept for backwards compatibility
      [newsCount],
      [activitiesCount],
      [unreadCount],
    ] = await Promise.all([
      db.select({ count: count() }).from(students).where(eq(students.status, "active")),
      db.select({ count: count() }).from(teachers),
      db.select({ count: count() }).from(classrooms),
      db.select({ count: count() }).from(subjects),
      db.select({ count: count() }).from(students).where(
        and(
          eq(students.enrollmentYear, academicEnrollmentYear),
          eq(students.status, "active"),
        )
      ),
      db.select({ count: count() }).from(students).where(
        eq(students.status, "dropped")
      ),
      db.select({ count: count() }).from(news),
      db.select({ count: count() }).from(activities),
      db.select({ count: count() }).from(contactMessages).where(eq(contactMessages.isRead, false)),
    ]);

    console.log("[GET] /api/stats - Success: Statistics calculated.");
    res.json({
      totalStudents: totalStudents?.count ?? 0,
      totalTeachers: totalTeachers?.count ?? 0,
      totalClasses: totalClasses?.count ?? 0,
      totalSubjects: totalSubjects?.count ?? 0,
      newStudents: newStudents?.count ?? 0,
      droppedStudents: droppedStudents?.count ?? 0,
      newsCount: newsCount?.count ?? 0,
      activitiesCount: activitiesCount?.count ?? 0,
      teachersCount: totalTeachers?.count ?? 0,
      studentsCount: totalStudents?.count ?? 0,
      unreadContactsCount: unreadCount?.count ?? 0,
    });
  } catch (err: any) {
    console.error("[GET] /api/stats - Error:", err);
    res.status(500).json({ error: "Failed to fetch stats", details: err.message });
  }
});

export default router;
