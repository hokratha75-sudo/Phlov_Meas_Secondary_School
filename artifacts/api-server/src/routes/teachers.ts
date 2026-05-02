import { Router } from "express";
import { db, teachers } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.get("/teachers", async (_req, res) => {
  const [items, [total]] = await Promise.all([
    db.select().from(teachers),
    db.select({ count: count() }).from(teachers),
  ]);
  res.json({ data: items.map(t => ({ ...t, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() })), total: total?.count ?? 0 });
});

router.post("/teachers", requireAuth, async (req, res) => {
  const body = req.body;
  const [item] = await db.insert(teachers).values({
    nameEn: body.nameEn, nameKh: body.nameKh,
    subjectEn: body.subjectEn, subjectKh: body.subjectKh,
    photoUrl: body.photoUrl ?? null, bioEn: body.bioEn ?? null,
    bioKh: body.bioKh ?? null, phone: body.phone ?? null, email: body.email ?? null,
  }).returning();
  res.status(201).json({ ...item!, createdAt: item!.createdAt.toISOString(), updatedAt: item!.updatedAt.toISOString() });
});

router.put("/teachers/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  const body = req.body;
  const [item] = await db.update(teachers).set({
    nameEn: body.nameEn, nameKh: body.nameKh,
    subjectEn: body.subjectEn, subjectKh: body.subjectKh,
    photoUrl: body.photoUrl ?? null, bioEn: body.bioEn ?? null,
    bioKh: body.bioKh ?? null, phone: body.phone ?? null, email: body.email ?? null,
    updatedAt: new Date(),
  }).where(eq(teachers.id, id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() });
});

router.delete("/teachers/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  await db.delete(teachers).where(eq(teachers.id, id));
  res.json({ message: "Deleted" });
});

export default router;
