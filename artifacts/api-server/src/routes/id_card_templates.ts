import { Router } from "express";
import { db, idCardTemplates } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

// GET /api/id-card-templates - List all templates
router.get("/id-card-templates", requireAuth, async (req: any, res) => {
  try {
    const [items, [total]] = await Promise.all([
      db.select().from(idCardTemplates).orderBy(desc(idCardTemplates.createdAt)),
      db.select({ count: count() }).from(idCardTemplates),
    ]);

    res.json({
      data: items.map(d => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      })),
      total: total?.count ?? 0,
    });
  } catch (err: any) {
    console.error("[GET] /api/id-card-templates - Error:", err);
    res.status(500).json({ error: "Failed to fetch templates", details: err.message });
  }
});

// POST /api/id-card-templates - Create template
router.post("/id-card-templates", requireAuth, async (req: any, res) => {
  try {
    const { name, baseStyle, config } = req.body;
    if (!name || !config) {
      res.status(400).json({ error: "Missing name or config" });
      return;
    }

    const [item] = await db.insert(idCardTemplates).values({
      name,
      baseStyle: baseStyle || 'classic',
      config,
    }).returning();

    res.status(201).json({
      ...item!,
      createdAt: item!.createdAt.toISOString(),
      updatedAt: item!.updatedAt.toISOString(),
    });
  } catch (err: any) {
    console.error("[POST] /api/id-card-templates - Error:", err);
    res.status(400).json({ error: "Failed to create template", details: err.message });
  }
});

// PUT /api/id-card-templates/:id - Update template
router.put("/id-card-templates/:id", requireAuth, async (req: any, res) => {
  const id = Number(req.params["id"]);
  try {
    const { name, baseStyle, config } = req.body;
    const [item] = await db.update(idCardTemplates)
      .set({
        ...(name && { name }),
        ...(baseStyle && { baseStyle }),
        ...(config && { config }),
        updatedAt: new Date(),
      })
      .where(eq(idCardTemplates.id, id))
      .returning();

    if (!item) {
      res.status(404).json({ error: "Template not found" });
      return;
    }

    res.json({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    });
  } catch (err: any) {
    console.error("[PUT] /api/id-card-templates/:id - Error:", err);
    res.status(400).json({ error: "Failed to update template", details: err.message });
  }
});

// DELETE /api/id-card-templates/:id - Delete template
router.delete("/id-card-templates/:id", requireAuth, async (req: any, res) => {
  const id = Number(req.params["id"]);
  try {
    await db.delete(idCardTemplates).where(eq(idCardTemplates.id, id));
    res.json({ message: "Template deleted successfully" });
  } catch (err: any) {
    console.error("[DELETE] /api/id-card-templates/:id - Error:", err);
    res.status(500).json({ error: "Failed to delete template", details: err.message });
  }
});

export default router;
