import { Router } from "express";
import { db, news } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.get("/news", async (req, res) => {
  const limit = Number(req.query["limit"]) || 20;
  const offset = Number(req.query["offset"]) || 0;
  const [items, [total]] = await Promise.all([
    db.select().from(news).orderBy(desc(news.publishedAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(news),
  ]);
  res.json({ data: items.map(n => ({ ...n, publishedAt: n.publishedAt.toISOString(), createdAt: n.createdAt.toISOString(), updatedAt: n.updatedAt.toISOString() })), total: total?.count ?? 0 });
});

router.get("/news/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  const [item] = await db.select().from(news).where(eq(news.id, id));
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...item, publishedAt: item.publishedAt.toISOString(), createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() });
});

router.post("/news", requireAuth, async (req, res) => {
  const body = req.body;
  const [item] = await db.insert(news).values({
    titleEn: body.titleEn, titleKh: body.titleKh,
    contentEn: body.contentEn, contentKh: body.contentKh,
    imageUrl: body.imageUrl ?? null, category: body.category || "general",
    isPublished: body.isPublished ?? true,
  }).returning();
  res.status(201).json({ ...item!, publishedAt: item!.publishedAt.toISOString(), createdAt: item!.createdAt.toISOString(), updatedAt: item!.updatedAt.toISOString() });
});

router.put("/news/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  const body = req.body;
  const [item] = await db.update(news).set({
    titleEn: body.titleEn, titleKh: body.titleKh,
    contentEn: body.contentEn, contentKh: body.contentKh,
    imageUrl: body.imageUrl ?? null, category: body.category,
    isPublished: body.isPublished ?? true,
    updatedAt: new Date(),
  }).where(eq(news.id, id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...item, publishedAt: item.publishedAt.toISOString(), createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() });
});

router.delete("/news/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  await db.delete(news).where(eq(news.id, id));
  res.json({ message: "Deleted" });
});

export default router;
