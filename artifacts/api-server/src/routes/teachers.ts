import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, teachers } from "@workspace/db";
import { eq, count, desc, and, sql } from "drizzle-orm";
import { requireAuth, requireAdmin } from "./auth";

const router = Router();

router.get("/teachers", async (req: any, res) => {
  console.log("[GET] /api/teachers - Fetching teachers list...");
  try {
    const limit = Number(req.query["limit"]) || 50;
    const offset = Number(req.query["offset"]) || 0;
    const search = req.query["search"] as string | undefined;
    const sortField = req.query["sortField"] as string | undefined;
    const sortDir = req.query["sortDir"] as string | undefined;

    const conditions = [];
    if (search) {
      conditions.push(
        sql`${teachers.nameKh} ILIKE ${`%${search}%`} OR 
            ${teachers.nameEn} ILIKE ${`%${search}%`} OR 
            ${teachers.subjectEn} ILIKE ${`%${search}%`} OR
            ${teachers.subjectKh} ILIKE ${`%${search}%`}`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderByClause = desc(teachers.createdAt);
    if (sortField) {
      const field = sortField === "nameKh" ? teachers.nameKh :
                    sortField === "nameEn" ? teachers.nameEn :
                    sortField === "subjectEn" ? teachers.subjectEn :
                    sortField === "subjectKh" ? teachers.subjectKh :
                    teachers.createdAt;
      
      orderByClause = sortDir === "asc" ? sql`${field} ASC` : sql`${field} DESC`;
    }

    const [items, [total]] = await Promise.all([
      db.query.teachers.findMany({
        where: whereClause,
        orderBy: [orderByClause],
        limit,
        offset,
      }),
      db.select({ count: count() })
        .from(teachers)
        .where(whereClause),
    ]);
    console.log(`[GET] /api/teachers - Success: Found ${items.length} teachers.`);
    // Never expose passwordHash to the client
    res.json({
      data: items.map(t => ({
        ...t,
        passwordHash: undefined,
        hasLoginAccount: !!(t.username && t.passwordHash),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      total: total?.count ?? 0,
    });
  } catch (err: any) {
    console.error("[GET] /api/teachers - Error:", err);
    res.status(500).json({ error: "Failed to fetch teachers", details: err.message });
  }
});

router.post("/teachers", requireAdmin, async (req, res) => {
  console.log("[POST] /api/teachers - Creating new teacher:", req.body.nameEn);
  try {
    const body = req.body;

    // Hash password if provided
    let passwordHash: string | null = null;
    if (body.password) {
      passwordHash = await bcrypt.hash(body.password, 10);
    }

    const [item] = await db.insert(teachers).values({
      nameEn: body.nameEn,
      nameKh: body.nameKh,
      subjectEn: body.subjectEn,
      subjectKh: body.subjectKh,
      photoUrl: body.photoUrl ?? null,
      bioEn: body.bioEn ?? null,
      bioKh: body.bioKh ?? null,
      phone: body.phone ?? null,
      email: body.email ?? null,
      address: body.address ?? null,
      gender: body.gender ?? null,
      dob: body.dob ?? null,
      pob: body.pob ?? null,
      officerId: body.officerId ?? null,
      position: body.position ?? null,
      educationLevel: body.educationLevel ?? null,
      employmentDate: body.employmentDate ?? null,
      framework: body.framework ?? null,
      additionalSubjects: body.additionalSubjects ?? null,
      additionalTeachingHours: body.additionalTeachingHours ?? null,
      designatedTeachingHours: body.designatedTeachingHours ?? null,
      remarks: body.remarks ?? null,
      familyStatus: body.familyStatus ?? null,
      degreeInfo: body.degreeInfo ?? null,
      pedagogyInfo: body.pedagogyInfo ?? null,
      trainingInfo: body.trainingInfo ?? null,
      workExperience: body.workExperience ?? null,
      teachingSkills: body.teachingSkills ?? null,
      techSkills: body.techSkills ?? null,
      languages: body.languages ?? null,
      username: body.username ?? null,
      passwordHash,
    }).returning();

    console.log("[POST] /api/teachers - Success: Created ID", item?.id);
    res.status(201).json({
      ...item!,
      passwordHash: undefined,
      hasLoginAccount: !!(item?.username && item?.passwordHash),
      createdAt: item!.createdAt.toISOString(),
      updatedAt: item!.updatedAt.toISOString(),
    });
  } catch (err: any) {
    console.error("[POST] /api/teachers - Error:", err);
    // Handle unique username conflict
    if (err.message?.includes("unique") || err.code === "23505") {
      res.status(400).json({ error: "Username already exists", details: err.message });
    } else {
      res.status(400).json({ error: "Failed to create teacher", details: err.message });
    }
  }
});
router.get("/teachers/profile/self", requireAuth, async (req: any, res) => {
  const role = req.adminUser?.role;
  const userId = req.adminUser?.id;

  if (role !== "teacher") {
    res.status(403).json({ error: "Only teachers can fetch their profile here" });
    return;
  }

  try {
    const [t] = await db.select().from(teachers).where(eq(teachers.id, userId));
    if (!t) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json({
      ...t,
      passwordHash: undefined,
      hasLoginAccount: !!(t.username && t.passwordHash),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch profile", details: err.message });
  }
});
router.put("/teachers/profile/self", requireAuth, async (req: any, res) => {
  const role = req.adminUser?.role;
  const userId = req.adminUser?.id;

  if (role !== "teacher") {
    res.status(403).json({ error: "Only teachers can update their personal profile here" });
    return;
  }

  console.log(`[PUT] /api/teachers/profile/self - Teacher ${userId} updating profile...`);
  try {
    const body = req.body;

    const updateData: Record<string, any> = {
      phone: body.phone ?? null,
      email: body.email ?? null,
      address: body.address ?? null,
      gender: body.gender ?? null,
      dob: body.dob ?? null,
      pob: body.pob ?? null,
      officerId: body.officerId ?? null,
      educationLevel: body.educationLevel ?? null,
      framework: body.framework ?? null,
      additionalSubjects: body.additionalSubjects ?? null,
      additionalTeachingHours: body.additionalTeachingHours ?? null,
      designatedTeachingHours: body.designatedTeachingHours ?? null,
      remarks: body.remarks ?? null,
      familyStatus: body.familyStatus ?? null,
      degreeInfo: body.degreeInfo ?? null,
      pedagogyInfo: body.pedagogyInfo ?? null,
      trainingInfo: body.trainingInfo ?? null,
      workExperience: body.workExperience ?? null,
      teachingSkills: body.teachingSkills ?? null,
      techSkills: body.techSkills ?? null,
      languages: body.languages ?? null,
      photoUrl: body.photoUrl ?? null,
      bioEn: body.bioEn ?? null,
      bioKh: body.bioKh ?? null,
      updatedAt: new Date(),
    };

    if (body.password) {
      updateData["passwordHash"] = await bcrypt.hash(body.password, 10);
    }

    const [item] = await db.update(teachers).set(updateData).where(eq(teachers.id, userId)).returning();
    if (!item) {
      res.status(404).json({ error: "Teacher profile not found" });
      return;
    }

    res.json({
      ...item,
      passwordHash: undefined,
      hasLoginAccount: !!(item.username && item.passwordHash),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    });
  } catch (err: any) {
    console.error(`[PUT] /api/teachers/profile/self - Error:`, err);
    res.status(400).json({ error: "Failed to update profile", details: err.message });
  }
});

router.put("/teachers/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params["id"]);
  console.log(`[PUT] /api/teachers/${id} - Updating teacher...`);
  try {
    const body = req.body;

    // Build update object
    const updateData: Record<string, any> = {
      nameEn: body.nameEn,
      nameKh: body.nameKh,
      subjectEn: body.subjectEn,
      subjectKh: body.subjectKh,
      photoUrl: body.photoUrl ?? null,
      bioEn: body.bioEn ?? null,
      bioKh: body.bioKh ?? null,
      phone: body.phone ?? null,
      email: body.email ?? null,
      address: body.address ?? null,
      gender: body.gender ?? null,
      dob: body.dob ?? null,
      pob: body.pob ?? null,
      officerId: body.officerId ?? null,
      position: body.position ?? null,
      educationLevel: body.educationLevel ?? null,
      employmentDate: body.employmentDate ?? null,
      framework: body.framework ?? null,
      additionalSubjects: body.additionalSubjects ?? null,
      additionalTeachingHours: body.additionalTeachingHours ?? null,
      designatedTeachingHours: body.designatedTeachingHours ?? null,
      remarks: body.remarks ?? null,
      familyStatus: body.familyStatus ?? null,
      degreeInfo: body.degreeInfo ?? null,
      pedagogyInfo: body.pedagogyInfo ?? null,
      trainingInfo: body.trainingInfo ?? null,
      workExperience: body.workExperience ?? null,
      teachingSkills: body.teachingSkills ?? null,
      techSkills: body.techSkills ?? null,
      languages: body.languages ?? null,
      updatedAt: new Date(),
    };

    // Update username if provided
    if (body.username !== undefined) {
      updateData["username"] = body.username || null;
    }
    // Hash new password only if provided
    if (body.password) {
      updateData["passwordHash"] = await bcrypt.hash(body.password, 10);
    }
    // Explicitly remove login (set username + hash to null)
    if (body.removeLogin === true) {
      updateData["username"] = null;
      updateData["passwordHash"] = null;
    }

    const [item] = await db.update(teachers).set(updateData).where(eq(teachers.id, id)).returning();
    if (!item) {
      console.warn(`[PUT] /api/teachers/${id} - Not found.`);
      res.status(404).json({ error: "Not found" });
      return;
    }
    console.log(`[PUT] /api/teachers/${id} - Success: Updated.`);
    res.json({
      ...item,
      passwordHash: undefined,
      hasLoginAccount: !!(item.username && item.passwordHash),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    });
  } catch (err: any) {
    console.error(`[PUT] /api/teachers/${id} - Error:`, err);
    if (err.message?.includes("unique") || err.code === "23505") {
      res.status(400).json({ error: "Username already exists", details: err.message });
    } else {
      res.status(400).json({ error: "Failed to update teacher", details: err.message });
    }
  }
});

router.delete("/teachers/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params["id"]);
  await db.delete(teachers).where(eq(teachers.id, id));
  res.json({ message: "Deleted" });
});

export default router;
