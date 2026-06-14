import { Router } from "express";
import { db, teacherLeaves, teachers, teacherLeaveBalances } from "@workspace/db";
import { eq, desc, count, and } from "drizzle-orm";
import { requireAuth } from "./auth";
// @ts-ignore
import ExcelJS from "exceljs";
import path from "path";
import { sendToTeachersChannel, sendDirectMessage } from "../lib/telegram";

const router = Router();

// Helper to get academic year from date (e.g., '2025-2026')
function getAcademicYear(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-indexed
  // Academic year typically starts in October/November in Cambodia
  if (month >= 10) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

// ─── Leave Balances Endpoint ──────────────────────────────────────────────
router.get("/leave-balances", requireAuth, async (req: any, res) => {
  try {
    const role = req.adminUser?.role;
    const userId = req.adminUser?.id;
    const teacherId = role === "teacher" ? userId : Number(req.query.teacherId);
    
    if (!teacherId) {
      res.status(400).json({ error: "teacherId is required" });
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const academicYear = req.query.academicYear || getAcademicYear(todayStr);

    let balance = await db.query.teacherLeaveBalances.findFirst({
      where: and(
        eq(teacherLeaveBalances.teacherId, teacherId),
        eq(teacherLeaveBalances.academicYear, academicYear)
      ),
    });

    // If balance doesn't exist, seed a default 15-day balance
    if (!balance) {
      const [newBalance] = await db.insert(teacherLeaveBalances).values({
        teacherId,
        academicYear,
        allowedDays: 15,
        usedDays: 0,
        remainingDays: 15,
      }).returning();
      balance = newBalance;
    }

    res.json(balance);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch leave balance", details: err.message });
  }
});

// GET all leave requests (Admin sees all; Teacher sees own)
router.get("/leave-requests", requireAuth, async (req: any, res) => {
  try {
    const role = req.adminUser?.role;
    const userId = req.adminUser?.id;

    let items;
    if (role === "teacher") {
      items = await db.query.teacherLeaves.findMany({
        where: eq(teacherLeaves.teacherId, userId),
        orderBy: [desc(teacherLeaves.createdAt)],
        with: { teacher: true },
      });
    } else {
      items = await db.query.teacherLeaves.findMany({
        orderBy: [desc(teacherLeaves.createdAt)],
        with: { teacher: true },
      });
    }

    const pendingCount = items.filter(i => i.status === "PENDING").length;

    res.json({
      data: items.map(i => ({
        ...i,
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
      })),
      total: items.length,
      pendingCount,
    });
  } catch (err: any) {
    console.error("[GET] /api/leave-requests - Error:", err);
    res.status(500).json({ error: "Failed to fetch leave requests", details: err.message });
  }
});

// GET export of leave requests to Excel
router.get("/leave-requests/export/excel", requireAuth, async (req: any, res) => {
  try {
    const role = req.adminUser?.role;
    const userId = req.adminUser?.id;

    // Fetch leave requests with teacher relationship
    let items;
    let teacherName = "";
    if (role === "teacher") {
      const [t] = await db.select().from(teachers).where(eq(teachers.id, userId));
      teacherName = t?.nameKh || "";
      items = await db.query.teacherLeaves.findMany({
        where: eq(teacherLeaves.teacherId, userId),
        orderBy: [desc(teacherLeaves.createdAt)],
        with: { teacher: true },
      });
    } else {
      items = await db.query.teacherLeaves.findMany({
        orderBy: [desc(teacherLeaves.createdAt)],
        with: { teacher: true },
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("របាយការណ៍សុំច្បាប់", {
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
      { key: "officerId", width: 18 },
      { key: "name", width: 32 },
      { key: "gender", width: 12 },
      { key: "position", width: 25 },
      { key: "unit", width: 25 },
      { key: "leaveType", width: 35 },
      { key: "days", width: 12 },
      { key: "startDate", width: 18 },
      { key: "endDate", width: 18 },
      { key: "reason", width: 40 },
      { key: "status", width: 20 },
    ];

    // Motto (Row 1-2, Right)
    worksheet.mergeCells("J1:L1");
    const motto1 = worksheet.getCell("J1");
    motto1.value = "ព្រះរាជាណាចក្រកម្ពុជា";
    motto1.font = { name: "Khmer OS Muol Light", size: 11, bold: true };
    motto1.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.mergeCells("J2:L2");
    const motto2 = worksheet.getCell("J2");
    motto2.value = "ជាតិ សាសនា ព្រះមហាក្សត្រ";
    motto2.font = { name: "Khmer OS Muol Light", size: 10, bold: true };
    motto2.alignment = { horizontal: "center", vertical: "middle" };

    // Administrative Wave/Tacteing symbol (Row 3, Right)
    worksheet.mergeCells("J3:L3");
    const wave = worksheet.getCell("J3");
    wave.value = "3";
    wave.font = { name: "Tacteing", size: 20 };
    wave.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(3).height = 20;

    // Institution info (Row 1-3, Left)
    const inst1 = worksheet.getCell("A1");
    inst1.value = "ក្រសួងអប់រំ យុវជន និងកីឡា";
    inst1.font = { name: "Khmer OS Muol Light", size: 11, bold: true };
    inst1.alignment = { horizontal: "left", vertical: "middle" };

    const inst2 = worksheet.getCell("A2");
    inst2.value = "វិទ្យាល័យ ផ្លូវមាស";
    inst2.font = { name: "Khmer OS Muol Light", size: 11, bold: true };
    inst2.alignment = { horizontal: "left", vertical: "middle" };

    const inst3 = worksheet.getCell("A3");
    inst3.value = "លេខ: ............................";
    inst3.font = { name: "Khmer OS Battambang", size: 10, italic: true };
    inst3.alignment = { horizontal: "left", vertical: "middle" };

    // Main Title (Row 5)
    worksheet.mergeCells("A5:L5");
    const title = worksheet.getCell("A5");
    if (role === "teacher") {
      title.value = `ប្រវត្តិការសុំច្បាប់ឈប់សម្រាករបស់លោក/លោកស្រី ${teacherName}`;
    } else {
      title.value = "តារាងសង្ខេបការសុំច្បាប់ឈប់សម្រាករបស់បុគ្គលិកនិងគ្រូបង្រៀន";
    }
    title.font = { name: "Khmer OS Muol Light", size: 14, bold: true, color: { argb: "FF1E3A6E" } };
    title.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(5).height = 30;

    // Headers (Row 7)
    const headerLabels = [
      "ល.រ", 
      "អត្តលេខមន្ត្រី", 
      "គោត្តនាម-នាម", 
      "ភេទ", 
      "មុខងារ",
      "ឯកទេស/អង្គភាព",
      "ប្រភេទច្បាប់", 
      "ចំនួនថ្ងៃ", 
      "ចាប់ពីថ្ងៃ", 
      "ដល់ថ្ងៃ", 
      "មូលហេតុ", 
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
      cell.font = { name: "Khmer OS Muol Light", size: 11, bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    });

    const LEAVE_TYPES = {
      ANNUAL: "ច្បាប់ឈប់សម្រាកប្រចាំឆ្នាំ (Annual)",
      SHORT_TERM: "ច្បាប់ឈប់សម្រាករយៈពេលខ្លី (Short-term)",
      SICK_LEAVE: "ច្បាប់សម្រាកព្យាបាលជំងឺ (Sick)",
      PERSONAL: "ច្បាប់សម្រាកកិច្ចការផ្ទាល់ខ្លួន (Personal)",
      MATERNITY: "ច្បាប់សម្រាកលំហែមាតុភាព (Maternity)",
    };

    const STATUS_LABELS = {
      PENDING: "កំពុងរង់ចាំ",
      APPROVED: "បានអនុម័ត",
      REJECTED: "បានបដិសេធ"
    };

    // Populate data
    items.forEach((item, index) => {
      const rowNum = 8 + index;
      const row = worksheet.getRow(rowNum);
      row.height = 28;

      const teacher = item.teacher as any;
      const genderText = teacher?.gender === "female" ? "ស្រី" : teacher?.gender === "male" ? "ប្រុស" : "—";
      const leaveLabel = LEAVE_TYPES[item.leaveType as keyof typeof LEAVE_TYPES] || item.leaveType || "—";
      const statusLabel = STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status || "—";

      row.getCell("A").value = index + 1;
      row.getCell("B").value = teacher?.officerId || teacher?.studentId || String(teacher?.id || "—");
      row.getCell("C").value = teacher?.nameKh || "—";
      row.getCell("D").value = genderText;
      row.getCell("E").value = teacher?.position || "—";
      row.getCell("F").value = teacher?.subjectKh || "—";
      row.getCell("G").value = leaveLabel;
      row.getCell("H").value = Number(item.totalDays) || 0;
      row.getCell("I").value = item.startDate || "—";
      row.getCell("J").value = item.endDate || "—";
      row.getCell("K").value = item.reason || "—";
      row.getCell("L").value = statusLabel;

      row.eachCell((cell: any, colNum: any) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } }
        };
        cell.font = { name: "Khmer OS Battambang", size: 11 };
        
        if ([3, 5, 6, 7, 11].includes(colNum)) {
          cell.alignment = { horizontal: "left", vertical: "middle", wrapText: false };
        } else {
          cell.alignment = { horizontal: "center", vertical: "middle", wrapText: false };
        }
      });

      // Inline styles for colors as dynamic fallback
      const statusCell = row.getCell("L");
      if (item.status === "APPROVED") {
        statusCell.font = { name: "Khmer OS Battambang", size: 11, bold: true, color: { argb: "FF166534" } };
        statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCFCE7" } };
      } else if (item.status === "REJECTED") {
        statusCell.font = { name: "Khmer OS Battambang", size: 11, bold: true, color: { argb: "FF991B1B" } };
        statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } };
      } else {
        statusCell.font = { name: "Khmer OS Battambang", size: 11, bold: true, color: { argb: "FFC2410C" } };
        statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFEDD5" } };
      }
    });

    // Add Excel dynamic Conditional Formatting for Status col
    if (items.length > 0) {
      worksheet.addConditionalFormatting({
        ref: `L8:L${7 + items.length}`,
        rules: [
          {
            priority: 1,
            type: "containsText",
            operator: "containsText",
            text: "បានអនុម័ត",
            style: {
              fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFDCFCE7" } },
              font: { color: { argb: "FF166534" }, bold: true }
            }
          },
          {
            priority: 2,
            type: "containsText",
            operator: "containsText",
            text: "បានបដិសេធ",
            style: {
              fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFEE2E2" } },
              font: { color: { argb: "FF991B1B" }, bold: true }
            }
          },
          {
            priority: 3,
            type: "containsText",
            operator: "containsText",
            text: "កំពុងរង់ចាំ",
            style: {
              fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFFEDD5" } },
              font: { color: { argb: "FFC2410C" }, bold: true }
            }
          }
        ]
      });
    }

    // Set Response headers for download
    const today = new Date().toISOString().split("T")[0];
    const safeTeacherName = teacherName ? teacherName.replace(/\s+/g, "_") : "Teacher";
    const filename = role === "teacher"
      ? `Leave_History_${encodeURIComponent(safeTeacherName)}_${today}.xlsx`
      : `Leave_Report_${today}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    console.error("[GET] /api/leave-requests/export/excel - Error:", err);
    res.status(500).json({ error: "Failed to generate Excel report", details: err.message });
  }
});

// GET export of individual leave request to A4 Excel (លិខិតសុំច្បាប់)
router.get("/leave-requests/:id/export/excel", requireAuth, async (req: any, res) => {
  try {
    const id = Number(req.params["id"]);
    const item = await db.query.teacherLeaves.findFirst({
      where: eq(teacherLeaves.id, id),
      with: { teacher: true },
    });
    if (!item) { res.status(404).json({ error: "Not found" }); return; }

    const role = req.adminUser?.role;
    if (role === "teacher" && item.teacherId !== req.adminUser.id) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const teacher = item.teacher as any;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("លិខិតសុំច្បាប់", {
      pageSetup: {
        paperSize: 9, // A4
        orientation: "portrait",
        margins: { left: 0.6, right: 0.6, top: 0.6, bottom: 0.6, header: 0, footer: 0 },
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 1
      }
    });

    worksheet.columns = [
      { key: "col1", width: 11 },
      { key: "col2", width: 11 },
      { key: "col3", width: 11 },
      { key: "col4", width: 11 },
      { key: "col5", width: 11 },
      { key: "col6", width: 11 },
      { key: "col7", width: 11 },
      { key: "col8", width: 11 },
    ];

    // Show Grid lines
    worksheet.views = [{ showGridLines: false }];

    // Draw School Logo (if available)
    try {
      const fs = await import("fs");
      const logoCandidates = [
        path.resolve(process.cwd(), "artifacts/admin/public/logosala.png"),
        path.resolve(process.cwd(), "artifacts/admin/public/logo.png"),
        path.resolve(process.cwd(), "../admin/public/logosala.png"),
        path.resolve(process.cwd(), "../admin/public/logo.png"),
      ];

      const logoPath = logoCandidates.find((candidate) => fs.existsSync(candidate));
      if (logoPath) {
        const logoId = workbook.addImage({
          filename: logoPath,
          extension: "png",
        });
        worksheet.addImage(logoId, {
          tl: { col: 0.2, row: 0.2 },
          ext: { width: 70, height: 70 }
        });
      } else {
        console.warn("Could not find school logo image for Excel export.");
      }
    } catch (e) {
      console.warn("Could not embed logo image:", e);
    }

    // Left Header
    worksheet.mergeCells("A5:C5");
    const inst1 = worksheet.getCell("A5");
    inst1.value = "ក្រសួងអប់រំ យុវជន និងកីឡា";
    inst1.font = { name: "Khmer OS Muol Light", size: 10, bold: true, color: { argb: "FF0E7490" } };
    inst1.alignment = { horizontal: "left", vertical: "middle" };

    worksheet.mergeCells("A6:C6");
    const inst2 = worksheet.getCell("A6");
    inst2.value = "វិទ្យាល័យ ផ្លូវមាស";
    inst2.font = { name: "Khmer OS Muol Light", size: 10, bold: true, color: { argb: "FF0E7490" } };
    inst2.alignment = { horizontal: "left", vertical: "middle" };

    worksheet.mergeCells("A7:C7");
    const inst3 = worksheet.getCell("A7");
    inst3.value = "លេខ: ............................";
    inst3.font = { name: "Khmer OS Siemreap", size: 9, italic: true };
    inst3.alignment = { horizontal: "left", vertical: "middle" };

    // Right Header
    worksheet.mergeCells("E2:H2");
    const motto1 = worksheet.getCell("E2");
    motto1.value = "ព្រះរាជាណាចក្រកម្ពុជា";
    motto1.font = { name: "Khmer OS Muol Light", size: 11, bold: true, color: { argb: "FF0E7490" } };
    motto1.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.mergeCells("E3:H3");
    const motto2 = worksheet.getCell("E3");
    motto2.value = "ជាតិ សាសនា ព្រះមហាក្សត្រ";
    motto2.font = { name: "Khmer OS Muol Light", size: 10, bold: true, color: { argb: "FF0E7490" } };
    motto2.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.mergeCells("E4:H4");
    const wave = worksheet.getCell("E4");
    wave.value = "3";
    wave.font = { name: "Tacteing", size: 18, color: { argb: "FF0E7490" } };
    wave.alignment = { horizontal: "center", vertical: "middle" };

    // Document Title
    worksheet.mergeCells("A9:H9");
    const titleCell = worksheet.getCell("A9");
    titleCell.value = "លិខិតសុំច្បាប់";
    titleCell.font = { name: "Khmer OS Muol Light", size: 18, bold: true, color: { argb: "FFFF0000" }, underline: "single" };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(9).height = 32;

    // Reference Line
    worksheet.mergeCells("A11:H11");
    const refCell = worksheet.getCell("A11");
    refCell.value = "យោង ៖ - អនុក្រឹត្យលេខ២១៧ អនក្រ.បក ចុះថ្ងៃទី ០២ ខែឧសភា ឆ្នាំ២០១៣ ស្តីពីការសុំច្បាប់ និងការអនុញ្ញាតច្បាប់គ្រប់ប្រភេទរបស់មន្ត្រីរាជការស៊ីវិលនៃព្រះរាជាណាចក្រកម្ពុជា ។";
    refCell.font = { name: "Khmer OS Battambang", size: 11, bold: true };
    refCell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
    worksheet.getRow(11).height = 30;

    // Setup teacher data with safe fallbacks
    const name = teacher?.nameKh || "—";
    const genderText = teacher?.gender === "female" ? "ស្រី" : teacher?.gender === "male" ? "ប្រុស" : "—";
    const idText = teacher?.officerId || teacher?.studentId || String(teacher?.id || "—");
    const dobText = teacher?.dob || "—";
    const subjectText = teacher?.position || teacher?.subjectKh || "—";
    const addressText = teacher?.address || "—";

    // Row 13 - Teacher Name, Gender, ID, DOB
    worksheet.mergeCells("A13:H13");
    const row13 = worksheet.getCell("A13");
    row13.value = {
      richText: [
        { text: "ខ្ញុំបាទ/នាងខ្ញុំឈ្មោះ ៖ ", font: { name: "Khmer OS Battambang", size: 11 } },
        { text: `${name} `, font: { name: "Khmer OS Battambang", size: 11, bold: true, color: { argb: "FF0000FF" } } },
        { text: "      ភេទ ៖ ", font: { name: "Khmer OS Battambang", size: 11 } },
        { text: `${genderText} `, font: { name: "Khmer OS Battambang", size: 11, bold: true, color: { argb: "FF0000FF" } } },
        { text: "      អត្តលេខ ៖ ", font: { name: "Khmer OS Battambang", size: 11 } },
        { text: `${idText} `, font: { name: "Khmer OS Battambang", size: 11, bold: true, color: { argb: "FF0000FF" } } },
        { text: "      ថ្ងៃខែឆ្នាំកំណើត ៖ ", font: { name: "Khmer OS Battambang", size: 11 } },
        { text: `${dobText}`, font: { name: "Khmer OS Battambang", size: 11, bold: true, color: { argb: "FF0000FF" } } },
      ]
    };
    row13.alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(13).height = 24;

    // Row 14 - Job, School, Address
    worksheet.mergeCells("A14:H14");
    const row14 = worksheet.getCell("A14");
    row14.value = {
      richText: [
        { text: "មុខងារ ៖ ", font: { name: "Khmer OS Battambang", size: 11 } },
        { text: `${subjectText} `, font: { name: "Khmer OS Battambang", size: 11, bold: true, color: { argb: "FF0000FF" } } },
        { text: "  នៃ ", font: { name: "Khmer OS Battambang", size: 11 } },
        { text: "វិទ្យាល័យ ផ្លូវមាស ", font: { name: "Khmer OS Muol Light", size: 11, bold: true, color: { argb: "FF0000FF" } } },
        { text: "      អាសយដ្ឋានបច្ចុប្បន្ន ៖ ", font: { name: "Khmer OS Battambang", size: 11 } },
        { text: `${addressText} `, font: { name: "Khmer OS Battambang", size: 11, bold: true, color: { argb: "FF0000FF" } } },
      ]
    };
    row14.alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(14).height = 24;

    // Row 16 - Salutation Intro
    worksheet.mergeCells("A16:H16");
    const row16 = worksheet.getCell("A16");
    row16.value = "សូមគោរពចូលមក";
    row16.font = { name: "Khmer OS Muol Light", size: 11, bold: true, color: { argb: "FF0E7490" }, underline: "single" };
    row16.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(16).height = 24;

    // Row 17 - Salutation Target
    worksheet.mergeCells("A17:H17");
    const row17 = worksheet.getCell("A17");
    row17.value = "លោកនាយក វិទ្យាល័យ ផ្លូវមាស";
    row17.font = { name: "Khmer OS Muol Light", size: 11, bold: true, color: { argb: "FF0000FF" } };
    row17.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(17).height = 24;

    // Row 19 - Subject
    worksheet.mergeCells("A19:H19");
    const row19 = worksheet.getCell("A19");
    row19.value = {
      richText: [
        { text: "កម្មវត្ថុ ៖   ", font: { name: "Khmer OS Muol Light", size: 10, bold: true } },
        { text: "សុំឈប់សម្រាកការងាររយៈពេល  ", font: { name: "Khmer OS Battambang", size: 11 } },
        { text: `${item.totalDays || 0} ថ្ងៃ`, font: { name: "Khmer OS Battambang", size: 11, bold: true, color: { argb: "FF0000FF" } } },
      ]
    };
    row19.alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(19).height = 24;

    // Row 20 - Reason
    worksheet.mergeCells("A20:H20");
    const row20 = worksheet.getCell("A20");
    row20.value = {
      richText: [
        { text: "មូលហេតុ ៖   ", font: { name: "Khmer OS Muol Light", size: 10, bold: true } },
        { text: `${item.reason || "—"}`, font: { name: "Khmer OS Battambang", size: 11, bold: true, color: { argb: "FF0000FF" } } },
      ]
    };
    row20.alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(20).height = 24;

    // Row 22 - Body text
    worksheet.mergeCells("A22:H23");
    const row22 = worksheet.getCell("A22");
    row22.value = {
      richText: [
        { text: "        អាស្រ័យដូចបានជម្រាបជូនខាងលើ សូមលោកនាយក មេត្តាអនុញ្ញាតឲ្យ ", font: { name: "Khmer OS Battambang", size: 11 } },
        { text: `${teacher?.gender === "female" ? "នាងខ្ញុំ" : "ខ្ញុំបាទ"} `, font: { name: "Khmer OS Battambang", size: 11, bold: true } },
        { text: "បានឈប់សម្រាកចំនួន ", font: { name: "Khmer OS Battambang", size: 11 } },
        { text: `${item.totalDays || 0} ថ្ងៃ `, font: { name: "Khmer OS Battambang", size: 11, bold: true, color: { argb: "FF0000FF" } } },
        { text: "គិតចាប់ពីថ្ងៃទី ", font: { name: "Khmer OS Battambang", size: 11 } },
        { text: `${item.startDate || "—"} `, font: { name: "Khmer OS Battambang", size: 11, bold: true, color: { argb: "FF0000FF" } } },
        { text: "ដល់ថ្ងៃទី ", font: { name: "Khmer OS Battambang", size: 11 } },
        { text: `${item.endDate || "—"} `, font: { name: "Khmer OS Battambang", size: 11, bold: true, color: { argb: "FF0000FF" } } },
        { text: "ដោយក្តីអនុគ្រោះ។", font: { name: "Khmer OS Battambang", size: 11 } },
      ]
    };
    row22.alignment = { horizontal: "left", vertical: "top", wrapText: true };
    worksheet.getRow(22).height = 20;
    worksheet.getRow(23).height = 20;

    // Row 25 - Respect salutation
    worksheet.mergeCells("A25:H25");
    const row25 = worksheet.getCell("A25");
    row25.value = "        សូមលោកនាយក មេត្តទទួលនូវការគោរពដ៏ខ្ពង់ខ្ពស់អំពីខ្ញុំបាទ/នាងខ្ញុំ។";
    row25.font = { name: "Khmer OS Battambang", size: 11, italic: true };
    row25.alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(25).height = 24;

    // Footer - Left Signature
    worksheet.mergeCells("A27:C27");
    const sigL1 = worksheet.getCell("A27");
    sigL1.value = "បានឃើញ និងឯកភាព";
    sigL1.font = { name: "Khmer OS Battambang", size: 11, bold: true, italic: true, color: { argb: "FF0E7490" } };
    sigL1.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.mergeCells("A28:C28");
    const sigL2 = worksheet.getCell("A28");
    sigL2.value = "នាយកវិទ្យាល័យ ផ្លូវមាស";
    sigL2.font = { name: "Khmer OS Muol Light", size: 10, bold: true, color: { argb: "FF1E3A6E" } };
    sigL2.alignment = { horizontal: "center", vertical: "middle" };

    // Footer - Right Signature
    worksheet.mergeCells("E27:H27");
    const sigR1 = worksheet.getCell("E27");
    sigR1.value = "ថ្ងៃ........................................... ព.ស. ២៥........";
    sigR1.font = { name: "Khmer OS Battambang", size: 10, italic: true };
    sigR1.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.mergeCells("E28:H28");
    const sigR2 = worksheet.getCell("E28");
    sigR2.value = "ធ្វើនៅ ផ្លូវមាស, ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២...";
    sigR2.font = { name: "Khmer OS Battambang", size: 10, italic: true };
    sigR2.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.mergeCells("E29:H29");
    const sigR3 = worksheet.getCell("E29");
    sigR3.value = "ហត្ថលេខានិងឈ្មោះសាមីខ្លួន";
    sigR3.font = { name: "Khmer OS Muol Light", size: 10, bold: true, color: { argb: "FF0E7490" } };
    sigR3.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.mergeCells("E33:H33");
    const sigR4 = worksheet.getCell("E33");
    sigR4.value = name;
    sigR4.font = { name: "Khmer OS Muol Light", size: 11, bold: true, color: { argb: "FF0000FF" } };
    sigR4.alignment = { horizontal: "center", vertical: "middle" };

    // Embed Teacher's Signature if available
    if (item.signatureUrl) {
      try {
        const fs = await import("fs");
        // Extract filename from URL (e.g. http://localhost:8080/uploads/file-xyz.png or /uploads/file-xyz.png)
        const parts = item.signatureUrl.split("/uploads/");
        if (parts.length > 1) {
          const filename = parts[parts.length - 1];
          const uploadDirCandidates = [
            path.resolve(process.cwd(), "../uploads"),
            path.resolve(process.cwd(), "uploads"),
            path.resolve(process.cwd(), "artifacts/uploads"),
            path.resolve(process.cwd(), "../artifacts/uploads"),
          ];
          const uploadDir = uploadDirCandidates.find((candidate) => fs.existsSync(candidate)) || uploadDirCandidates[0];
          const signaturePath = path.resolve(uploadDir, filename);

          if (fs.existsSync(signaturePath)) {
            const sigId = workbook.addImage({
              filename: signaturePath,
              extension: filename.toLowerCase().endsWith(".png") ? "png" : "jpeg",
            });
            worksheet.addImage(sigId, {
              tl: { col: 4.8, row: 29.5 }, // Centered in E30:H32
              ext: { width: 130, height: 50 }
            });
          } else {
            console.warn(`Signature file does not exist locally at path: ${signaturePath}`);
          }
        }
      } catch (e) {
        console.warn("Failed to embed signature in Excel:", e);
      }
    }

    // Set Response headers for download
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="Leave_Request_${id}.xlsx"`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    console.error("[GET] /api/leave-requests/:id/export/excel - Error:", err);
    require("fs").writeFileSync("error.log", err.stack || err.message);
    res.status(500).json({ error: "Failed to generate Excel sheet", details: err.message, stack: err.stack });
  }
});

// GET single leave request (with strict ownership check)
router.get("/leave-requests/:id", requireAuth, async (req: any, res) => {
  try {
    const id = Number(req.params["id"]);
    const item = await db.query.teacherLeaves.findFirst({
      where: eq(teacherLeaves.id, id),
      with: { teacher: true },
    });
    if (!item) { res.status(404).json({ error: "Not found" }); return; }

    const role = req.adminUser?.role;
    if (role === "teacher" && item.teacherId !== req.adminUser.id) {
      res.status(403).json({ error: "Access denied: you can only view your own leave requests" });
      return;
    }

    res.json({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch leave request", details: err.message });
  }
});

// GET pending count (for notification badge)
router.get("/leave-requests-pending-count", requireAuth, async (req: any, res) => {
  try {
    const role = req.adminUser?.role;
    const userId = req.adminUser?.id;
    let pending;

    if (role === "teacher") {
      // Teachers do not approve leave requests, so they should not get a pending notification badge
      res.json({ count: 0 });
      return;
    } else {
      pending = await db
        .select({ count: count() })
        .from(teacherLeaves)
        .where(eq(teacherLeaves.status, "PENDING"));
    }

    res.json({ count: pending[0]?.count ?? 0 });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to count", details: err.message });
  }
});

// POST — Teacher submits leave request complying with Sub-decree 217
router.post("/leave-requests", requireAuth, async (req: any, res) => {
  try {
    const role = req.adminUser?.role;
    const userId = req.adminUser?.id;

    console.log(`[POST] /api/leave-requests - role=${role}, userId=${userId}, body=`, JSON.stringify(req.body));

    let teacherId: number;
    if (role === "teacher") {
      teacherId = Number(userId);
    } else {
      teacherId = Number(req.body.teacherId);
    }

    if (!teacherId || isNaN(teacherId)) {
      res.status(400).json({ error: "គ្មាន teacherId ត្រឹមត្រូវទេ។ សូម login ឡើងវិញ។" });
      return;
    }

    const { leaveType, startDate, endDate, totalDays, reason, addressDuringLeave, attachmentUrl } = req.body;

    // Validate each field individually for clearer error messages
    if (!leaveType) { res.status(400).json({ error: "សូមជ្រើសប្រភេទច្បាប់ឈប់សម្រាក។" }); return; }
    if (!startDate) { res.status(400).json({ error: "សូមជ្រើសកាលបរិច្ឆេទចាប់ផ្ដើម។" }); return; }
    if (!endDate) { res.status(400).json({ error: "សូមជ្រើសកាលបរិច្ឆេទបញ្ចប់។" }); return; }
    if (!reason || String(reason).trim() === "") { res.status(400).json({ error: "សូមបំពេញមូលហេតុ។" }); return; }
    if (!addressDuringLeave || String(addressDuringLeave).trim() === "") { res.status(400).json({ error: "សូមបំពេញអាសយដ្ឋានអំឡុងពេលឈប់សម្រាក។" }); return; }

    const totalDaysNum = Number(totalDays);
    if (isNaN(totalDaysNum) || totalDaysNum <= 0) {
      res.status(400).json({ error: "ចំនួនថ្ងៃឈប់សម្រាកត្រូវតែធំជាង ០ ថ្ងៃ។" });
      return;
    }

    // Sub-decree 217 Validations:
    if (leaveType === "ANNUAL") {
      if (totalDaysNum > 15) {
        res.status(400).json({ error: "ច្បាប់ឈប់ប្រចាំឆ្នាំ មិនអាចលើសពី ១៥ ថ្ងៃ ក្នុងមួយឆ្នាំឡើយ។" });
        return;
      }

      // Check current leave balance
      const acadYear = getAcademicYear(startDate);
      let balance = await db.query.teacherLeaveBalances.findFirst({
        where: and(
          eq(teacherLeaveBalances.teacherId, teacherId),
          eq(teacherLeaveBalances.academicYear, acadYear)
        ),
      });

      if (!balance) {
        // Create initial balance
        const [newBalance] = await db.insert(teacherLeaveBalances).values({
          teacherId,
          academicYear: acadYear,
          allowedDays: 15,
          usedDays: 0,
          remainingDays: 15,
        }).returning();
        balance = newBalance;
      }

      if (balance.remainingDays < totalDaysNum) {
        res.status(400).json({
          error: `ច្បាប់ឈប់ប្រចាំឆ្នាំដែលនៅសល់មិនគ្រប់គ្រាន់ឡើយ (នៅសល់ ${balance.remainingDays} ថ្ងៃ ប៉ុន្តែស្នើសុំ ${totalDaysNum} ថ្ងៃ)។`
        });
        return;
      }
    } else if (leaveType === "MATERNITY") {
      if (totalDaysNum > 90) {
        res.status(400).json({ error: "ច្បាប់សម្រាកលំហែមាតុភាព មិនអាចលើសពី ៩០ ថ្ងៃឡើយ។" });
        return;
      }
    }

    const [item] = await db.insert(teacherLeaves).values({
      teacherId,
      leaveType,
      startDate,
      endDate,
      totalDays: totalDaysNum,
      reason: String(reason).trim(),
      addressDuringLeave: String(addressDuringLeave).trim(),
      attachmentUrl: attachmentUrl || null,
      signatureUrl: req.body.signatureUrl || null,
      status: "PENDING",
    }).returning();

    console.log(`[POST] /api/leave-requests - Created request ${item?.id} for teacherId=${teacherId}`);

    // --- TELEGRAM NOTIFICATION ---
    const [t] = await db.select().from(teachers).where(eq(teachers.id, teacherId));
    const teacherName = t?.nameKh || "លោកគ្រូ/អ្នកគ្រូ";
    const msg = `📝 <b>ពាក្យសុំច្បាប់ថ្មី</b>\n\nលោកគ្រូ/អ្នកគ្រូ៖ <b>${teacherName}</b>\nចំនួន៖ ${totalDaysNum} ថ្ងៃ\nប្រភេទ៖ ${leaveType}\nមូលហេតុ៖ ${reason}\n\n<i>សូមនាយកសាលាពិនិត្យ និងអនុម័ត!</i>`;
    sendToTeachersChannel(msg).catch(e => console.error("Telegram error:", e));

    res.status(201).json({ ...item!, createdAt: item!.createdAt.toISOString(), updatedAt: item!.updatedAt.toISOString() });
  } catch (err: any) {
    console.error("[POST] /api/leave-requests - Error:", err);
    res.status(400).json({ error: "Failed to create leave request", details: err.message });
  }
});

// PUT — Admin updates status (APPROVED / REJECTED)
router.put("/leave-requests/:id", requireAuth, async (req: any, res) => {
  try {
    const id = Number(req.params["id"]);
    const role = req.adminUser?.role;
    const userId = req.adminUser?.id;

    const existing = await db.query.teacherLeaves.findFirst({ where: eq(teacherLeaves.id, id) });
    if (!existing) { res.status(404).json({ error: "Not found" }); return; }

    let updateData: Record<string, any> = { updatedAt: new Date() };

    if (role === "admin" || !role) {
      const { status, adminNote } = req.body;
      if (status) updateData["status"] = status;
      if (adminNote !== undefined) updateData["adminNote"] = adminNote;

      // Handle Balance deduction on approval under Sub-decree 217
      if (status === "APPROVED" && existing.status !== "APPROVED" && existing.leaveType === "ANNUAL") {
        const acadYear = getAcademicYear(existing.startDate);
        const balance = await db.query.teacherLeaveBalances.findFirst({
          where: and(
            eq(teacherLeaveBalances.teacherId, existing.teacherId),
            eq(teacherLeaveBalances.academicYear, acadYear)
          ),
        });

        if (balance) {
          const newUsed = balance.usedDays + existing.totalDays;
          const newRemaining = Math.max(0, balance.allowedDays - newUsed);
          await db.update(teacherLeaveBalances).set({
            usedDays: newUsed,
            remainingDays: newRemaining,
            updatedAt: new Date(),
          }).where(eq(teacherLeaveBalances.id, balance.id));
        }
      }

      // Handle Reverting Balance if changed back from APPROVED to REJECTED/PENDING
      if (existing.status === "APPROVED" && status && status !== "APPROVED" && existing.leaveType === "ANNUAL") {
        const acadYear = getAcademicYear(existing.startDate);
        const balance = await db.query.teacherLeaveBalances.findFirst({
          where: and(
            eq(teacherLeaveBalances.teacherId, existing.teacherId),
            eq(teacherLeaveBalances.academicYear, acadYear)
          ),
        });

        if (balance) {
          const newUsed = Math.max(0, balance.usedDays - existing.totalDays);
          const newRemaining = Math.min(balance.allowedDays, balance.allowedDays - newUsed);
          await db.update(teacherLeaveBalances).set({
            usedDays: newUsed,
            remainingDays: newRemaining,
            updatedAt: new Date(),
          }).where(eq(teacherLeaveBalances.id, balance.id));
        }
      }
    } else {
      // Teacher updates their own PENDING requests
      if (existing.teacherId !== userId) {
        res.status(403).json({ error: "Cannot edit another teacher's request" });
        return;
      }
      if (existing.status !== "PENDING") {
        res.status(400).json({ error: "Cannot edit a request that is already reviewed" });
        return;
      }

      const { leaveType, startDate, endDate, totalDays, reason, addressDuringLeave, attachmentUrl } = req.body;
      if (leaveType) updateData["leaveType"] = leaveType;
      if (startDate) updateData["startDate"] = startDate;
      if (endDate) updateData["endDate"] = endDate;
      if (totalDays) updateData["totalDays"] = Number(totalDays);
      if (reason) updateData["reason"] = reason;
      if (addressDuringLeave) updateData["addressDuringLeave"] = addressDuringLeave;
      if (attachmentUrl !== undefined) updateData["attachmentUrl"] = attachmentUrl;
    }

    const [item] = await db.update(teacherLeaves).set(updateData).where(eq(teacherLeaves.id, id)).returning();

    // ─── TELEGRAM DM NOTIFICATION on status change ───
    if ((role === "admin" || !role) && req.body.status && req.body.status !== existing.status) {
      try {
        const [teacher] = await db.select().from(teachers).where(eq(teachers.id, existing.teacherId));
        if (teacher?.telegramChatId) {
          const statusEmoji = req.body.status === 'APPROVED' ? '✅' : '❌';
          const statusText = req.body.status === 'APPROVED' ? 'បានអនុម័ត' : 'បានបដិសេធ';
          const noteText = req.body.adminNote ? `\n📝 កំណត់ចំណាំ: ${req.body.adminNote}` : '';

          const dmMsg = `${statusEmoji} <b>ការជូនដំណឹងអំពីសំណើសុំច្បាប់</b>\n\nសួស្តី <b>${teacher.nameKh}</b>!\nសំណើសុំច្បាប់របស់អ្នកត្រូវបាន <b>${statusText}</b>។\n\n📋 ប្រភេទ៖ ${existing.leaveType}\n📅 រយៈពេល៖ ${existing.startDate} → ${existing.endDate} (${existing.totalDays} ថ្ងៃ)\n📝 មូលហេតុ៖ ${existing.reason}${noteText}\n\nសូមប្រើ /mystatus ដើម្បីមើលសមតុល្យច្បាប់។`;

          sendDirectMessage(teacher.telegramChatId, dmMsg).catch(e => console.error('DM notification error:', e));
        }
      } catch (notifErr) {
        console.error('Failed to send leave status DM:', notifErr);
      }
    }

    res.json({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() });
  } catch (err: any) {
    console.error(`[PUT] /api/leave-requests/${req.params["id"]} - Error:`, err);
    res.status(400).json({ error: "Failed to update leave request", details: err.message });
  }
});

// DELETE — Admin or owner can delete PENDING request
router.delete("/leave-requests/:id", requireAuth, async (req: any, res) => {
  const id = Number(req.params["id"]);
  await db.delete(teacherLeaves).where(eq(teacherLeaves.id, id));
  res.json({ message: "Deleted" });
});

export default router;
