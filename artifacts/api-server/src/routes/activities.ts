import { Router } from "express";
import { db, activities } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.get("/activities", async (req, res) => {
  const limit = Number(req.query["limit"]) || 20;
  const offset = Number(req.query["offset"]) || 0;
  const [items, [total]] = await Promise.all([
    db.select().from(activities).orderBy(desc(activities.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(activities),
  ]);
  res.json({ data: items.map(a => ({ ...a, createdAt: a.createdAt.toISOString(), updatedAt: a.updatedAt.toISOString() })), total: total?.count ?? 0 });
});

router.get("/activities/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  const [item] = await db.select().from(activities).where(eq(activities.id, id));
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() });
});

router.post("/activities", requireAuth, async (req, res) => {
  const body = req.body;
  const [item] = await db.insert(activities).values({
    titleEn: body.titleEn, titleKh: body.titleKh,
    descriptionEn: body.descriptionEn, descriptionKh: body.descriptionKh,
    category: body.category || "general",
    imageUrl: body.imageUrl ?? null,
    eventDate: body.eventDate,
    likes: body.likes ?? 0,
    commentsCount: body.commentsCount ?? 0,
  }).returning();
  res.status(201).json({ ...item!, createdAt: item!.createdAt.toISOString(), updatedAt: item!.updatedAt.toISOString() });
});

router.put("/activities/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  const body = req.body;
  const [item] = await db.update(activities).set({
    titleEn: body.titleEn, titleKh: body.titleKh,
    descriptionEn: body.descriptionEn, descriptionKh: body.descriptionKh,
    category: body.category, imageUrl: body.imageUrl ?? null,
    eventDate: body.eventDate, likes: body.likes ?? 0,
    commentsCount: body.commentsCount ?? 0,
    updatedAt: new Date(),
  }).where(eq(activities.id, id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() });
});

router.delete("/activities/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  await db.delete(activities).where(eq(activities.id, id));
  res.json({ message: "Deleted" });
});

export default router;
