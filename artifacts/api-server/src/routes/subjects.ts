import { Router } from "express";
import { db, subjects } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

/**
 * GET /api/subjects
 * Fetches all available subjects.
 */
router.get("/", requireAuth, async (_req, res) => {
  try {
    const data = await db.select().from(subjects);
    res.json({ data });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

/**
 * POST /api/subjects
 * Create a new subject.
 */
router.post("/", requireAuth, async (req, res) => {
  const { nameEn, nameKh, code } = req.body;
  console.log("DEBUG: POST /api/subjects", { nameEn, nameKh, code });
  try {
    const [item] = await db.insert(subjects).values({
      nameEn,
      nameKh,
      code,
      updatedAt: new Date()
    }).returning();
    res.status(201).json(item);
  } catch (error: any) {
    console.error("CRITICAL ERROR: POST /api/subjects failed", error);
    res.status(500).json({ error: error.message || "Database insertion failed" });
  }
});

/**
 * PUT /api/subjects/:id
 * Update an existing subject.
 */
router.put("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const { nameEn, nameKh, code } = req.body;
  try {
    const [item] = await db.update(subjects)
      .set({ nameEn, nameKh, code, updatedAt: new Date() })
      .where(eq(subjects.id, id))
      .returning();
    if (!item) {
      res.status(404).json({ error: "Subject not found" });
      return;
    }
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/subjects/:id
 */
router.delete("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await db.delete(subjects).where(eq(subjects.id, id));
    res.json({ message: "Deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
