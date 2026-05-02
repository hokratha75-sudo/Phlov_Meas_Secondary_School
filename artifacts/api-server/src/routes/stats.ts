import { Router } from "express";
import { db, news, activities, teachers, students, contactMessages } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.get("/stats", requireAuth, async (_req, res) => {
  const [[newsCount], [activitiesCount], [teachersCount], [studentsCount], [unreadCount]] = await Promise.all([
    db.select({ count: count() }).from(news),
    db.select({ count: count() }).from(activities),
    db.select({ count: count() }).from(teachers),
    db.select({ count: count() }).from(students),
    db.select({ count: count() }).from(contactMessages).where(eq(contactMessages.isRead, false)),
  ]);
  res.json({
    newsCount: newsCount?.count ?? 0,
    activitiesCount: activitiesCount?.count ?? 0,
    teachersCount: teachersCount?.count ?? 0,
    studentsCount: studentsCount?.count ?? 0,
    unreadContactsCount: unreadCount?.count ?? 0,
  });
});

export default router;
