import { Router } from "express";
import { db, parents, students, classrooms } from "@workspace/db";
import { eq, count, desc, and, or, like, inArray, isNotNull } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

// Sync helper to populate parents from students parentPhone fields
async function syncParentsFromStudents() {
  try {
    const studentsList = await db.select().from(students).where(isNotNull(students.parentPhone));
    let synced = 0;
    
    for (const student of studentsList) {
      if (!student.parentPhone) continue;
      
      // Check if parent already exists for this student + phone combination
      const existing = await db.select()
        .from(parents)
        .where(
          and(
            eq(parents.studentId, student.id),
            eq(parents.phone, student.parentPhone)
          )
        )
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(parents).values({
          studentId: student.id,
          phone: student.parentPhone,
          parentName: "មិនបានបញ្ជាក់", // Khmer for "Not specified"
          createdAt: new Date(),
          updatedAt: new Date()
        });
        synced++;
      }
    }
    console.log(`[Parents Sync] Populated ${synced} parent records from students.`);
  } catch (err: any) {
    console.error("[Parents Sync] Failed to auto-sync parents:", err.message);
  }
}

// ─── GET /parents — List parent records ──────────────────────────────────────
router.get("/parents", requireAuth, async (req: any, res) => {
  try {
    const limit = Number(req.query["limit"]) || 50;
    const offset = Number(req.query["offset"]) || 0;
    const search = (req.query["search"] as string || "").trim();
    
    // Auto-sync on first load if the parents table is empty
    const [parentsCount] = await db.select({ count: count() }).from(parents);
    if ((parentsCount?.count ?? 0) === 0) {
      await syncParentsFromStudents();
    }

    // Teachers can only view parents of students in their classrooms
    const role = req.adminUser?.role;
    const userId = req.adminUser?.id;
    let allowedStudentIds: number[] | null = null;

    if (role === "teacher") {
      const teacherClasses = await db.select({ id: classrooms.id }).from(classrooms).where(eq(classrooms.teacherId, userId));
      const classIds = teacherClasses.map(c => c.id);
      
      if (classIds.length === 0) {
        res.json({ data: [], total: 0 });
        return;
      }

      const teacherStudents = await db.select({ id: students.id }).from(students).where(inArray(students.classId, classIds));
      allowedStudentIds = teacherStudents.map(s => s.id);
      
      if (allowedStudentIds.length === 0) {
        res.json({ data: [], total: 0 });
        return;
      }
    }

    // Build conditions
    const conditions = [];
    if (allowedStudentIds) {
      conditions.push(inArray(parents.studentId, allowedStudentIds));
    }

    if (search) {
      const searchQuery = `%${search}%`;
      // Search by parent name, phone, or student name/code (done via student query if needed, or inline join)
      conditions.push(
        or(
          like(parents.parentName, searchQuery),
          like(parents.phone, searchQuery)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch parents with student relations
    const parentRecords = await db.query.parents.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: [desc(parents.createdAt)],
      with: {
        student: {
          with: {
            classroom: true
          }
        }
      }
    });

    const [total] = await db.select({ count: count() }).from(parents).where(whereClause);

    // Format response
    const data = parentRecords.map(p => ({
      id: p.id,
      studentId: p.studentId,
      studentName: p.student ? `${p.student.nameKh} (${p.student.nameEn})` : "N/A",
      studentCode: p.student?.studentId || "N/A",
      classroomName: p.student?.classroom?.name || "N/A",
      parentName: p.parentName,
      phone: p.phone,
      telegramChatId: p.telegramChatId,
      telegramLinkCode: p.telegramLinkCode,
      telegramLinkedAt: p.telegramLinkedAt ? p.telegramLinkedAt.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    res.json({ data, total: total?.count ?? 0 });
  } catch (err: any) {
    console.error("[GET] /parents - Error:", err);
    res.status(500).json({ error: "Failed to fetch parent records", details: err.message });
  }
});

// ─── POST /parents — Create parent record ────────────────────────────────────
router.post("/parents", requireAuth, async (req: any, res) => {
  try {
    const { studentId, parentName, phone } = req.body;
    if (!studentId || !parentName || !phone) {
      res.status(400).json({ error: "studentId, parentName, and phone are required" });
      return;
    }

    // Check if the student exists
    const [student] = await db.select().from(students).where(eq(students.id, studentId));
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    // Check duplicate StudentId + Phone
    const [existing] = await db.select()
      .from(parents)
      .where(and(eq(parents.studentId, studentId), eq(parents.phone, phone)));
      
    if (existing) {
      res.status(409).json({ error: "This parent contact already exists for the selected student" });
      return;
    }

    const [parentRecord] = await db.insert(parents).values({
      studentId,
      parentName,
      phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    res.status(201).json({
      ...parentRecord,
      createdAt: parentRecord.createdAt.toISOString(),
      updatedAt: parentRecord.updatedAt.toISOString(),
    });
  } catch (err: any) {
    console.error("[POST] /parents - Error:", err);
    res.status(500).json({ error: "Failed to create parent record", details: err.message });
  }
});

// ─── PUT /parents/:id — Update parent record ──────────────────────────────────
router.put("/parents/:id", requireAuth, async (req: any, res) => {
  try {
    const id = Number(req.params["id"]);
    const { parentName, phone } = req.body;
    
    const [parentRecord] = await db.select().from(parents).where(eq(parents.id, id));
    if (!parentRecord) {
      res.status(404).json({ error: "Parent record not found" });
      return;
    }

    // Check duplicates if phone is changing
    if (phone && phone !== parentRecord.phone) {
      const [existing] = await db.select()
        .from(parents)
        .where(and(eq(parents.studentId, parentRecord.studentId), eq(parents.phone, phone)));
      if (existing) {
        res.status(409).json({ error: "This parent contact already exists for the selected student" });
        return;
      }
    }

    const [updated] = await db.update(parents)
      .set({
        parentName: parentName ?? parentRecord.parentName,
        phone: phone ?? parentRecord.phone,
        updatedAt: new Date(),
      })
      .where(eq(parents.id, id))
      .returning();

    res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err: any) {
    console.error("[PUT] /parents/:id - Error:", err);
    res.status(500).json({ error: "Failed to update parent record", details: err.message });
  }
});

// ─── DELETE /parents/:id — Delete parent record (Admin only) ──────────────────
router.delete("/parents/:id", requireAuth, async (req: any, res) => {
  try {
    const id = Number(req.params["id"]);
    const role = req.adminUser?.role;

    if (role === "teacher") {
      res.status(403).json({ error: "Only admins can delete parent records" });
      return;
    }

    await db.delete(parents).where(eq(parents.id, id));
    res.json({ message: "Parent record deleted successfully" });
  } catch (err: any) {
    console.error("[DELETE] /parents/:id - Error:", err);
    res.status(500).json({ error: "Failed to delete parent record", details: err.message });
  }
});

export default router;
