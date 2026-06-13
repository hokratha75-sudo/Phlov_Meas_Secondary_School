import { Router } from "express";
import { db, classrooms } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.get("/classrooms", async (_req, res) => {
  console.log("[GET] /api/classrooms - Fetching classrooms...");
  try {
    const [items, [total]] = await Promise.all([
      db.query.classrooms.findMany({
        with: {
          teacher: true,
          students: {
            columns: { id: true }
          }
        }
      }),
      db.select({ count: count() }).from(classrooms),
    ]);
    console.log(`[GET] /api/classrooms - Success: Found ${items.length} classrooms.`);
    res.json({ data: items.map(t => {
      const { students, ...rest } = t;
      return {
        ...rest,
        studentsCount: students?.length ?? 0,
        createdAt: rest.createdAt.toISOString(),
        updatedAt: rest.updatedAt.toISOString()
      };
    }), total: total?.count ?? 0 });
  } catch (err: any) {
    console.error("[GET] /api/classrooms - Error:", err);
    res.status(500).json({ error: "Failed to fetch classrooms", details: err.message });
  }
});

router.post("/classrooms", requireAuth, async (req, res) => {
  console.log("[POST] /api/classrooms - Creating classroom:", req.body.name);
  try {
    const body = req.body;
    const [item] = await db.insert(classrooms).values({
      name: body.name,
      grade: body.grade,
      roomNumber: body.roomNumber ?? null,
      teacherId: body.teacherId ? Number(body.teacherId) : null,
    }).returning();
    console.log("[POST] /api/classrooms - Success: Created ID", item?.id);
    res.status(201).json({ ...item!, createdAt: item!.createdAt.toISOString(), updatedAt: item!.updatedAt.toISOString() });
  } catch (err: any) {
    console.error("[POST] /api/classrooms - Error:", err);
    res.status(400).json({ error: "Failed to create classroom", details: err.message });
  }
});

router.put("/classrooms/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  console.log(`[PUT] /api/classrooms/${id} - Updating classroom...`);
  try {
    const body = req.body;
    const [item] = await db.update(classrooms).set({
      name: body.name,
      grade: body.grade,
      roomNumber: body.roomNumber ?? null,
      teacherId: body.teacherId ? Number(body.teacherId) : null,
      updatedAt: new Date(),
    }).where(eq(classrooms.id, id)).returning();
    if (!item) { 
      console.warn(`[PUT] /api/classrooms/${id} - Not found.`);
      res.status(404).json({ error: "Not found" }); 
      return; 
    }
    console.log(`[PUT] /api/classrooms/${id} - Success: Updated.`);
    res.json({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() });
  } catch (err: any) {
    console.error(`[PUT] /api/classrooms/${id} - Error:`, err);
    res.status(400).json({ error: "Failed to update classroom", details: err.message });
  }
});

router.delete("/classrooms/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  await db.delete(classrooms).where(eq(classrooms.id, id));
  res.json({ message: "Deleted" });
});

export default router;
