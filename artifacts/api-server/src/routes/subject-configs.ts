import { Router } from "express";
import { db, subjectConfigs, subjects } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

/**
 * GET /api/subject-configs
 * Fetch all subjects and their configurations (LEFT JOIN) for a specific grade level and track.
 */
router.get("/subject-configs", async (req, res) => {
  const { gradeLevel, isScienceTrack } = req.query;
  console.log("DEBUG: GET /api/subject-configs", { gradeLevel, isScienceTrack });

  try {
    if (!gradeLevel) {
      return res.status(400).json({ error: "gradeLevel is required" });
    }

    const gl = Number(gradeLevel);
    const ist = isScienceTrack === "true";

    // Check if subjects table is empty first to diagnose data issues
    let allSubjects;
    try {
      allSubjects = await db.select().from(subjects);
    } catch (dbErr: any) {
      console.error("DATABASE ERROR (subjects fetch):", dbErr);
      return res.status(500).json({ error: "Database error fetching subjects", details: dbErr.message });
    }

    if (allSubjects.length === 0) {
      console.warn("DEBUG: subjects table is empty!");
      return res.json({ data: [], message: "No subjects found in database" });
    }

    // Perform Left Join to get all subjects even if no config exists
    let data;
    try {
      data = await db
        .select({
          id: subjects.id,
          nameEn: subjects.nameEn,
          nameKh: subjects.nameKh,
          code: subjects.code,
          maxScore: subjectConfigs.maxScore,
          coefficient: subjectConfigs.coefficient,
        })
        .from(subjects)
        .leftJoin(
          subjectConfigs,
          and(
            sql`${subjectConfigs.subjectId} = ${subjects.id}`,
            eq(subjectConfigs.gradeLevel, gl),
            eq(subjectConfigs.isScienceTrack, ist)
          )
        );
    } catch (joinErr: any) {
      console.error("DATABASE ERROR (merged join):", joinErr);
      return res.status(500).json({ error: "Database error in merged join", details: joinErr.message });
    }

    console.log(`DEBUG: Successfully fetched ${data.length} merged records`);
    res.json({ data });
    return;
  } catch (error) {
    console.error("Error fetching merged subject configs:", error);
    res.status(500).json({ 
      error: "Failed to fetch configurations", 
      details: error instanceof Error ? error.message : String(error) 
    });
    return;
  }
});

/**
 * POST /api/subject-configs/batch
 * Batch update/upsert coefficients for an entire grade level.
 */
router.post("/subject-configs/batch", requireAuth, async (req, res) => {
  const { configs } = req.body; // Expects array of { gradeLevel, subjectId, maxScore, isScienceTrack }

  if (!Array.isArray(configs) || configs.length === 0) {
    return res.status(400).json({ error: "Invalid or empty configurations list" });
  }

  try {
    // Perform bulk upsert
      for (const config of configs) {
        await db
          .insert(subjectConfigs)
          .values({
            gradeLevel: config.gradeLevel,
            subjectId: config.subjectId,
            maxScore: config.maxScore.toString(),
            coefficient: (config.coefficient || "1.00").toString(),
            isScienceTrack: config.isScienceTrack || false,
          })
          .onConflictDoUpdate({
            target: [subjectConfigs.gradeLevel, subjectConfigs.subjectId, subjectConfigs.isScienceTrack],
            set: {
              maxScore: config.maxScore.toString(),
              coefficient: (config.coefficient || "1.00").toString(),
            },
          });
      }

    res.json({ message: "Configurations updated successfully" });
    return;
  } catch (error) {
    console.error("Error batch updating subject configs:", error);
    res.status(500).json({ error: "Failed to batch update configurations" });
    return;
  }
});

export default router;
