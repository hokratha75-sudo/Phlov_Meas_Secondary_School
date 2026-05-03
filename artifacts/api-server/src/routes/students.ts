import { Router } from "express";
import { db, students } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.get("/students", async (req, res) => {
  const limit = Number(req.query["limit"]) || 50;
  const offset = Number(req.query["offset"]) || 0;
  const grade = req.query["grade"] as string | undefined;
  const [items, [total]] = await Promise.all([
    grade
      ? db.select().from(students).where(eq(students.grade, grade)).orderBy(desc(students.createdAt)).limit(limit).offset(offset)
      : db.select().from(students).orderBy(desc(students.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(students),
  ]);
  res.json({ data: items.map(s => ({ ...s, createdAt: s.createdAt.toISOString(), updatedAt: s.updatedAt.toISOString() })), total: total?.count ?? 0 });
});

router.post("/students", requireAuth, async (req, res) => {
  const body = req.body;
  const [item] = await db.insert(students).values({
    studentId: body.studentId, nameEn: body.nameEn, nameKh: body.nameKh,
    grade: body.grade, gender: body.gender,
    enrollmentYear: body.enrollmentYear,
    phone: body.phone ?? null, parentPhone: body.parentPhone ?? null,
    address: body.address ?? null,
  }).returning();
  res.status(201).json({ ...item!, createdAt: item!.createdAt.toISOString(), updatedAt: item!.updatedAt.toISOString() });
});

router.put("/students/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  const body = req.body;
  const [item] = await db.update(students).set({
    studentId: body.studentId, nameEn: body.nameEn, nameKh: body.nameKh,
    grade: body.grade, gender: body.gender,
    enrollmentYear: body.enrollmentYear,
    phone: body.phone ?? null, parentPhone: body.parentPhone ?? null,
    address: body.address ?? null, updatedAt: new Date(),
  }).where(eq(students.id, id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() });
});

router.delete("/students/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  await db.delete(students).where(eq(students.id, id));
  res.json({ message: "Deleted" });
});

export default router;
