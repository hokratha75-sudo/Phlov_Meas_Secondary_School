import { Router } from "express";
import { db, libraryLogs, students, classrooms } from "@workspace/db";
import { eq, and, or, ilike, count, desc, inArray } from "drizzle-orm";
import { requireAuth } from "./auth";
// @ts-ignore
import ExcelJS from "exceljs";

const router = Router();

// GET /api/library/logs - Paginated and searchable library logs using Drizzle Relational Queries
router.get("/library/logs", requireAuth, async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const conditions = [];

    if (status && status !== "All") {
      conditions.push(eq(libraryLogs.bookStatus, status));
    }

    if (search) {
      // 1. Find matching student IDs first
      const matchedStudents = await db
        .select({ id: students.id })
        .from(students)
        .where(
          or(
            ilike(students.nameKh, `%${search}%`),
            ilike(students.nameEn, `%${search}%`),
            ilike(students.studentId, `%${search}%`)
          )
        );

      const studentIds = matchedStudents.map((s) => s.id);

      // 2. Build or condition for book details and student IDs
      const searchConditions = [
        ilike(libraryLogs.bookTitle, `%${search}%`),
        ilike(libraryLogs.bookCode, `%${search}%`)
      ];

      if (studentIds.length > 0) {
        searchConditions.push(inArray(libraryLogs.studentId, studentIds));
      }

      conditions.push(or(...searchConditions));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const logsData = await db.query.libraryLogs.findMany({
      where: whereClause,
      with: {
        student: {
          with: {
            classroom: true
          }
        }
      },
      limit,
      offset,
      orderBy: [desc(libraryLogs.createdAt)],
    });

    const [totalCountResult] = await db
      .select({ count: count() })
      .from(libraryLogs)
      .leftJoin(students, eq(libraryLogs.studentId, students.id))
      .where(whereClause);

    const data = logsData.map((row) => ({
      id: row.id,
      studentId: row.studentId,
      bookTitle: row.bookTitle,
      bookCode: row.bookCode ?? null,
      borrowDate: row.borrowDate.toISOString(),
      returnDate: row.returnDate ? row.returnDate.toISOString() : null,
      dueDate: row.dueDate ? row.dueDate.toISOString() : null,
      bookStatus: row.bookStatus,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      student: row.student ? {
        id: row.student.id,
        studentId: row.student.studentId,
        nameEn: row.student.nameEn,
        nameKh: row.student.nameKh,
        grade: row.student.grade,
        gender: row.student.gender,
        enrollmentYear: row.student.enrollmentYear,
        phone: row.student.phone ?? null,
        parentPhone: row.student.parentPhone ?? null,
        address: row.student.address ?? null,
        photoUrl: row.student.photoUrl ?? null,
        biography: row.student.biography ?? null,
        familyStatus: row.student.familyStatus ?? null,
        disciplineLogs: [],
        createdAt: row.student.createdAt.toISOString(),
        updatedAt: row.student.updatedAt.toISOString(),
        classroom: row.student.classroom ? {
          id: row.student.classroom.id,
          name: row.student.classroom.name,
          grade: row.student.classroom.grade,
          roomNumber: row.student.classroom.roomNumber ?? null,
          teacherId: row.student.classroom.teacherId ?? null,
          studentsCount: 0,
          createdAt: row.student.classroom.createdAt.toISOString(),
          updatedAt: row.student.classroom.updatedAt.toISOString(),
        } : undefined
      } : undefined
    }));

    res.json({
      data,
      total: totalCountResult?.count ?? 0,
    });
  } catch (err: any) {
    console.error("Error fetching library logs:", err);
    res.status(500).json({ error: "Failed to fetch library logs", details: err.message });
  }
});

// POST /api/library/logs - Create borrowing log
router.post("/library/logs", requireAuth, async (req, res) => {
  try {
    const body = req.body;
    if (!body.studentId || !body.bookTitle || !body.bookStatus || !body.borrowDate) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const [inserted] = await db.insert(libraryLogs).values({
      studentId: Number(body.studentId),
      bookTitle: body.bookTitle,
      bookCode: body.bookCode ?? null,
      borrowDate: new Date(body.borrowDate),
      returnDate: body.returnDate ? new Date(body.returnDate) : null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      bookStatus: body.bookStatus,
    }).returning();

    const row = await db.query.libraryLogs.findFirst({
      where: eq(libraryLogs.id, inserted.id),
      with: {
        student: {
          with: {
            classroom: true
          }
        }
      }
    });

    if (!row) {
      res.status(500).json({ error: "Failed to retrieve created record" });
      return;
    }

    res.status(201).json({
      id: row.id,
      studentId: row.studentId,
      bookTitle: row.bookTitle,
      bookCode: row.bookCode ?? null,
      borrowDate: row.borrowDate.toISOString(),
      returnDate: row.returnDate ? row.returnDate.toISOString() : null,
      dueDate: row.dueDate ? row.dueDate.toISOString() : null,
      bookStatus: row.bookStatus,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      student: row.student ? {
        id: row.student.id,
        studentId: row.student.studentId,
        nameEn: row.student.nameEn,
        nameKh: row.student.nameKh,
        grade: row.student.grade,
        gender: row.student.gender,
        enrollmentYear: row.student.enrollmentYear,
        phone: row.student.phone ?? null,
        parentPhone: row.student.parentPhone ?? null,
        address: row.student.address ?? null,
        photoUrl: row.student.photoUrl ?? null,
        biography: row.student.biography ?? null,
        familyStatus: row.student.familyStatus ?? null,
        disciplineLogs: [],
        createdAt: row.student.createdAt.toISOString(),
        updatedAt: row.student.updatedAt.toISOString(),
        classroom: row.student.classroom ? {
          id: row.student.classroom.id,
          name: row.student.classroom.name,
          grade: row.student.classroom.grade,
          roomNumber: row.student.classroom.roomNumber ?? null,
          teacherId: row.student.classroom.teacherId ?? null,
          studentsCount: 0,
          createdAt: row.student.classroom.createdAt.toISOString(),
          updatedAt: row.student.classroom.updatedAt.toISOString(),
        } : undefined
      } : undefined
    });
  } catch (err: any) {
    console.error("Error creating library log:", err);
    res.status(400).json({ error: "Failed to create library log", details: err.message });
  }
});

// PUT /api/library/logs/:id - Update borrowing log (edit/return)
router.put("/library/logs/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body;

    const [updated] = await db.update(libraryLogs).set({
      studentId: Number(body.studentId),
      bookTitle: body.bookTitle,
      bookCode: body.bookCode ?? null,
      borrowDate: new Date(body.borrowDate),
      returnDate: body.returnDate ? new Date(body.returnDate) : null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      bookStatus: body.bookStatus,
      updatedAt: new Date(),
    }).where(eq(libraryLogs.id, id)).returning();

    if (!updated) {
      res.status(404).json({ error: "Library log not found" });
      return;
    }

    const row = await db.query.libraryLogs.findFirst({
      where: eq(libraryLogs.id, id),
      with: {
        student: {
          with: {
            classroom: true
          }
        }
      }
    });

    if (!row) {
      res.status(500).json({ error: "Failed to retrieve updated record" });
      return;
    }

    res.json({
      id: row.id,
      studentId: row.studentId,
      bookTitle: row.bookTitle,
      bookCode: row.bookCode ?? null,
      borrowDate: row.borrowDate.toISOString(),
      returnDate: row.returnDate ? row.returnDate.toISOString() : null,
      dueDate: row.dueDate ? row.dueDate.toISOString() : null,
      bookStatus: row.bookStatus,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      student: row.student ? {
        id: row.student.id,
        studentId: row.student.studentId,
        nameEn: row.student.nameEn,
        nameKh: row.student.nameKh,
        grade: row.student.grade,
        gender: row.student.gender,
        enrollmentYear: row.student.enrollmentYear,
        phone: row.student.phone ?? null,
        parentPhone: row.student.parentPhone ?? null,
        address: row.student.address ?? null,
        photoUrl: row.student.photoUrl ?? null,
        biography: row.student.biography ?? null,
        familyStatus: row.student.familyStatus ?? null,
        disciplineLogs: [],
        createdAt: row.student.createdAt.toISOString(),
        updatedAt: row.student.updatedAt.toISOString(),
        classroom: row.student.classroom ? {
          id: row.student.classroom.id,
          name: row.student.classroom.name,
          grade: row.student.classroom.grade,
          roomNumber: row.student.classroom.roomNumber ?? null,
          teacherId: row.student.classroom.teacherId ?? null,
          studentsCount: 0,
          createdAt: row.student.classroom.createdAt.toISOString(),
          updatedAt: row.student.classroom.updatedAt.toISOString(),
        } : undefined
      } : undefined
    });
  } catch (err: any) {
    console.error("Error updating library log:", err);
    res.status(400).json({ error: "Failed to update library log", details: err.message });
  }
});

// DELETE /api/library/logs/:id - Delete borrowing log
router.delete("/library/logs/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(libraryLogs).where(eq(libraryLogs.id, id));
    res.json({ message: "Library log deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting library log:", err);
    res.status(500).json({ error: "Failed to delete library log", details: err.message });
  }
});

// GET /api/reports/library/export - Export library logs to Excel
router.get("/reports/library/export", requireAuth, async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const conditions = [];
    if (status && status !== "All") {
      conditions.push(eq(libraryLogs.bookStatus, status));
    }
    if (search) {
      const matchedStudents = await db
        .select({ id: students.id })
        .from(students)
        .where(
          or(
            ilike(students.nameKh, `%${search}%`),
            ilike(students.nameEn, `%${search}%`),
            ilike(students.studentId, `%${search}%`)
          )
        );

      const studentIds = matchedStudents.map((s) => s.id);

      const searchConditions = [
        ilike(libraryLogs.bookTitle, `%${search}%`),
        ilike(libraryLogs.bookCode, `%${search}%`)
      ];

      if (studentIds.length > 0) {
        searchConditions.push(inArray(libraryLogs.studentId, studentIds));
      }

      conditions.push(or(...searchConditions));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await db.query.libraryLogs.findMany({
      where: whereClause,
      with: {
        student: {
          with: {
            classroom: true
          }
        }
      },
      orderBy: [desc(libraryLogs.createdAt)]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("របាយការណ៍បណ្ណាល័យ", {
      pageSetup: {
        paperSize: 9, // A4
        orientation: "landscape",
        margins: { left: 0.4, right: 0.4, top: 0.4, bottom: 0.4, header: 0, footer: 0 },
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0
      }
    });

    worksheet.columns = [
      { key: "no", width: 8 },
      { key: "studentId", width: 18 },
      { key: "studentName", width: 30 },
      { key: "gender", width: 10 },
      { key: "classroom", width: 15 },
      { key: "bookCode", width: 18 },
      { key: "bookTitle", width: 35 },
      { key: "borrowDate", width: 18 },
      { key: "dueDate", width: 18 },
      { key: "returnDate", width: 18 },
      { key: "status", width: 18 },
    ];

    // Motto (Row 1-2, Right)
    worksheet.mergeCells("I1:K1");
    const motto1 = worksheet.getCell("I1");
    motto1.value = "ព្រះរាជាណាចក្រកម្ពុជា";
    motto1.font = { name: "Khmer OS Muol Light", size: 11, bold: true };
    motto1.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.mergeCells("I2:K2");
    const motto2 = worksheet.getCell("I2");
    motto2.value = "ជាតិ សាសនា ព្រះមហាក្សត្រ";
    motto2.font = { name: "Khmer OS Muol Light", size: 10, bold: true };
    motto2.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.mergeCells("I3:K3");
    const wave = worksheet.getCell("I3");
    wave.value = "3";
    wave.font = { name: "Tacteing", size: 20 };
    wave.alignment = { horizontal: "center", vertical: "middle" };

    // Institution info
    const inst1 = worksheet.getCell("A1");
    inst1.value = "ក្រសួងអប់រំ យុវជន និងកីឡា";
    inst1.font = { name: "Khmer OS Muol Light", size: 11, bold: true };
    inst1.alignment = { horizontal: "left", vertical: "middle" };

    const inst2 = worksheet.getCell("A2");
    inst2.value = "វិទ្យាល័យ ផ្លូវមាស";
    inst2.font = { name: "Khmer OS Muol Light", size: 11, bold: true };
    inst2.alignment = { horizontal: "left", vertical: "middle" };

    // Main Title
    worksheet.mergeCells("A5:K5");
    const title = worksheet.getCell("A5");
    title.value = "របាយការណ៍ការខ្ចី-សងសៀវភៅបណ្ណាល័យសាលា";
    title.font = { name: "Khmer OS Muol Light", size: 14, bold: true, color: { argb: "FF1E3A6E" } };
    title.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(5).height = 30;

    // Headers
    const headerLabels = [
      "ល.រ", 
      "អត្តលេខសិស្ស", 
      "ឈ្មោះសិស្ស", 
      "ភេទ", 
      "ថ្នាក់រៀន", 
      "លេខកូដសៀវភៅ", 
      "ចំណងជើងសៀវភៅ", 
      "ថ្ងៃខ្ចី", 
      "ថ្ងៃត្រូវសង", 
      "ថ្ងៃសងពិតប្រាកដ", 
      "ស្ថានភាព"
    ];
    const headerRow = worksheet.getRow(7);
    headerRow.values = headerLabels;
    headerRow.height = 30;
    headerRow.eachCell((cell: any) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF2F2F2" }
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } }
      };
      cell.font = { name: "Khmer OS Muol Light", size: 10, bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    });

    const STATUS_MAP = {
      Borrowed: "កំពុងខ្ចី",
      Returned: "សងរួច",
      Overdue: "ហួសកំណត់"
    };

    // Populate data
    items.forEach((item, index) => {
      const rowNum = 8 + index;
      const row = worksheet.getRow(rowNum);
      row.height = 28;

      const genderText = item.student?.gender === "female" ? "ស្រី" : item.student?.gender === "male" ? "ប្រុស" : "—";
      const statusText = STATUS_MAP[item.bookStatus as keyof typeof STATUS_MAP] || item.bookStatus || "—";
      
      const formatDate = (date: Date | null) => {
        if (!date) return "—";
        return date.toISOString().split("T")[0];
      };

      row.getCell("A").value = index + 1;
      row.getCell("B").value = item.student?.studentId || "—";
      row.getCell("C").value = item.student?.nameKh || item.student?.nameEn || "—";
      row.getCell("D").value = genderText;
      row.getCell("E").value = item.student?.classroom?.name || "—";
      row.getCell("F").value = item.bookCode || "—";
      row.getCell("G").value = item.bookTitle || "—";
      row.getCell("H").value = formatDate(item.borrowDate);
      row.getCell("I").value = formatDate(item.dueDate);
      row.getCell("J").value = formatDate(item.returnDate);
      row.getCell("K").value = statusText;

      row.eachCell((cell: any, colNum: any) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } }
        };
        cell.font = { name: "Khmer OS Battambang", size: 10 };
        
        if ([3, 7].includes(colNum)) {
          cell.alignment = { horizontal: "left", vertical: "middle", wrapText: false };
        } else {
          cell.alignment = { horizontal: "center", vertical: "middle", wrapText: false };
        }
      });

      const statusCell = row.getCell("K");
      if (item.bookStatus === "Returned") {
        statusCell.font = { name: "Khmer OS Battambang", size: 10, bold: true, color: { argb: "FF166534" } };
        statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCFCE7" } };
      } else if (item.bookStatus === "Overdue") {
        statusCell.font = { name: "Khmer OS Battambang", size: 10, bold: true, color: { argb: "FF991B1B" } };
        statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } };
      } else {
        statusCell.font = { name: "Khmer OS Battambang", size: 10, bold: true, color: { argb: "FF1E40AF" } };
        statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDBEAFE" } };
      }
    });

    const today = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="Library_Report_${today}.xlsx"`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    console.error("Excel generation error:", err);
    res.status(500).json({ error: "Failed to generate Excel report", details: err.message });
  }
});

export default router;
