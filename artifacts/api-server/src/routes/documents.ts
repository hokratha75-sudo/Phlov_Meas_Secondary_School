import { Router } from "express";
import { db, documents, documentCategories } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { requireAuth, requireAdmin } from "./auth";
import path from "path";
import fs from "fs";

const router = Router();

// GET /api/documents - Available to both Admin and Teacher
router.get("/documents", requireAuth, async (req: any, res) => {
  console.log("[GET] /api/documents - Fetching documents list...");
  try {
    const [items, [total]] = await Promise.all([
      db.select({
        id: documents.id,
        title: documents.title,
        description: documents.description,
        fileUrl: documents.fileUrl,
        fileName: documents.fileName,
        fileSize: documents.fileSize,
        fileType: documents.fileType,
        uploadedById: documents.uploadedById,
        categoryId: documents.categoryId,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        categoryNameEn: documentCategories.nameEn,
        categoryNameKh: documentCategories.nameKh,
      })
      .from(documents)
      .leftJoin(documentCategories, eq(documents.categoryId, documentCategories.id))
      .orderBy(desc(documents.createdAt)),
      db.select({ count: count() }).from(documents),
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
    console.error("[GET] /api/documents - Error:", err);
    res.status(500).json({ error: "Failed to fetch documents", details: err.message });
  }
});

// POST /api/documents - Only Admin can create
router.post("/documents", requireAdmin, async (req: any, res) => {
  console.log("[POST] /api/documents - Creating new document record...");
  try {
    const { title, description, fileUrl, fileName, fileSize, fileType, categoryId } = req.body;
    const uploadedById = req.adminUser.id;

    if (!title || !fileUrl || !fileName || !fileSize || !fileType) {
      res.status(400).json({ error: "Missing required document fields" });
      return;
    }

    const [item] = await db.insert(documents).values({
      title,
      description: description ?? null,
      fileUrl,
      fileName,
      fileSize: Number(fileSize),
      fileType,
      uploadedById,
      categoryId: categoryId ? Number(categoryId) : null,
    }).returning();

    console.log("[POST] /api/documents - Success: Created document ID", item?.id);
    res.status(201).json({
      ...item!,
      createdAt: item!.createdAt.toISOString(),
      updatedAt: item!.updatedAt.toISOString(),
    });
  } catch (err: any) {
    console.error("[POST] /api/documents - Error:", err);
    res.status(400).json({ error: "Failed to create document record", details: err.message });
  }
});

// DELETE /api/documents/:id - Only Admin can delete
router.delete("/documents/:id", requireAdmin, async (req: any, res) => {
  const id = Number(req.params["id"]);
  console.log(`[DELETE] /api/documents/${id} - Deleting document...`);
  try {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    if (!doc) {
      console.warn(`[DELETE] /api/documents/${id} - Document not found in DB.`);
      res.status(404).json({ error: "Document not found" });
      return;
    }

    // Attempt to delete physical file from uploads folder
    try {
      // fileUrl is e.g. "/uploads/1712345678-1234.pdf"
      // uploadDir is artifacts/uploads
      const uploadDir = path.resolve(process.cwd(), "../uploads");
      const baseFileName = path.basename(doc.fileUrl);
      const filePath = path.join(uploadDir, baseFileName);
      
      console.log(`[DELETE] /api/documents/${id} - Attempting physical file deletion at:`, filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[DELETE] /api/documents/${id} - Successfully deleted physical file.`);
      } else {
        console.log(`[DELETE] /api/documents/${id} - Physical file not found on disk.`);
      }
    } catch (fileErr: any) {
      console.error(`[DELETE] /api/documents/${id} - Physical file deletion error (non-blocking):`, fileErr);
    }

    // Delete record from DB
    await db.delete(documents).where(eq(documents.id, id));
    console.log(`[DELETE] /api/documents/${id} - Success: Deleted DB record.`);
    res.json({ message: "Document deleted successfully" });
  } catch (err: any) {
    console.error(`[DELETE] /api/documents/${id} - Error:`, err);
    res.status(500).json({ error: "Failed to delete document", details: err.message });
  }
});

export default router;
