import { Router } from "express";
import { db, documentCategories } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "./auth";

const router = Router();

// GET /api/document-categories - Accessible to authenticated users (admins, teachers)
router.get("/document-categories", requireAuth, async (req: any, res) => {
  console.log("[GET] /api/document-categories - Fetching categories...");
  try {
    const items = await db.select().from(documentCategories).orderBy(desc(documentCategories.createdAt));
    res.json({
      data: items.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    });
  } catch (err: any) {
    console.error("[GET] /api/document-categories - Error:", err);
    res.status(500).json({ error: "Failed to fetch document categories", details: err.message });
  }
});

// POST /api/document-categories - Admin only
router.post("/document-categories", requireAdmin, async (req: any, res) => {
  console.log("[POST] /api/document-categories - Creating new category...");
  try {
    const { nameEn, nameKh } = req.body;

    if (!nameEn || !nameKh) {
      res.status(400).json({ error: "Missing required fields (nameEn and nameKh)" });
      return;
    }

    const [item] = await db.insert(documentCategories).values({
      nameEn,
      nameKh,
    }).returning();

    console.log("[POST] /api/document-categories - Success: Created ID", item?.id);
    res.status(201).json({
      ...item!,
      createdAt: item!.createdAt.toISOString(),
      updatedAt: item!.updatedAt.toISOString(),
    });
  } catch (err: any) {
    console.error("[POST] /api/document-categories - Error:", err);
    res.status(400).json({ error: "Failed to create document category", details: err.message });
  }
});

// PUT /api/document-categories/:id - Admin only
router.put("/document-categories/:id", requireAdmin, async (req: any, res) => {
  const id = Number(req.params.id);
  console.log(`[PUT] /api/document-categories/${id} - Updating category...`);
  try {
    const { nameEn, nameKh } = req.body;

    if (!nameEn || !nameKh) {
      res.status(400).json({ error: "Missing required fields (nameEn and nameKh)" });
      return;
    }

    const [existing] = await db.select().from(documentCategories).where(eq(documentCategories.id, id));
    if (!existing) {
      res.status(404).json({ error: "Document category not found" });
      return;
    }

    const [item] = await db.update(documentCategories)
      .set({
        nameEn,
        nameKh,
        updatedAt: new Date(),
      })
      .where(eq(documentCategories.id, id))
      .returning();

    console.log(`[PUT] /api/document-categories/${id} - Success`);
    res.json({
      ...item!,
      createdAt: item!.createdAt.toISOString(),
      updatedAt: item!.updatedAt.toISOString(),
    });
  } catch (err: any) {
    console.error(`[PUT] /api/document-categories/${id} - Error:`, err);
    res.status(400).json({ error: "Failed to update document category", details: err.message });
  }
});

// DELETE /api/document-categories/:id - Admin only
router.delete("/document-categories/:id", requireAdmin, async (req: any, res) => {
  const id = Number(req.params.id);
  console.log(`[DELETE] /api/document-categories/${id} - Deleting category...`);
  try {
    const [existing] = await db.select().from(documentCategories).where(eq(documentCategories.id, id));
    if (!existing) {
      res.status(404).json({ error: "Document category not found" });
      return;
    }

    await db.delete(documentCategories).where(eq(documentCategories.id, id));
    console.log(`[DELETE] /api/document-categories/${id} - Success`);
    res.json({ message: "Document category deleted successfully" });
  } catch (err: any) {
    console.error(`[DELETE] /api/document-categories/${id} - Error:`, err);
    res.status(500).json({ error: "Failed to delete document category", details: err.message });
  }
});

export default router;
