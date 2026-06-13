import { Router } from "express";
import { db, contactMessages } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.post("/contacts", async (req, res) => {
  const body = req.body;
  const [item] = await db.insert(contactMessages).values({
    fullName: body.fullName, phone: body.phone ?? null,
    email: body.email ?? null, message: body.message,
    isRead: false
  }).returning();
  res.status(201).json({ ...item!, createdAt: item!.createdAt.toISOString() });
});

router.get("/contacts/unread-count", requireAuth, async (req: any, res) => {
  try {
    const role = req.adminUser?.role;
    if (role !== "admin") {
      res.json({ count: 0 });
      return;
    }
    const [result] = await db.select({ count: count() }).from(contactMessages).where(eq(contactMessages.isRead, false));
    res.json({ count: result?.count ?? 0 });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to count", details: err.message });
  }
});

router.get("/contacts", requireAuth, async (req, res) => {
  const limit = Number(req.query["limit"]) || 20;
  const offset = Number(req.query["offset"]) || 0;
  const [items, [total]] = await Promise.all([
    db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(contactMessages),
  ]);
  res.json({ data: items.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })), total: total?.count ?? 0 });
});

router.patch("/contacts/:id/read", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  const [item] = await db.update(contactMessages).set({ isRead: true }).where(eq(contactMessages.id, id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...item, createdAt: item.createdAt.toISOString() });
});

router.delete("/contacts/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  res.json({ message: "Deleted" });
});

export default router;
