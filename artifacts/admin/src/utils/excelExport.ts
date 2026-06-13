import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// We'll use 'any' or generic types for the input data since the actual types come from the generated API client.
export const exportTeachersListToExcel = async (teachers: any[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("បញ្ជីគ្រូបង្រៀន", {
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  // Setup columns
  worksheet.columns = [
    { key: "index", width: 5 },
    { key: "officerId", width: 15 },
    { key: "name", width: 25 },
    { key: "gender", width: 8 },
    { key: "dob", width: 15 },
    { key: "position", width: 15 },
    { key: "framework", width: 10 },
    { key: "specialty", width: 15 },
    { key: "addSubjects", width: 20 },
    { key: "desigHours", width: 12 },
    { key: "addHours", width: 12 },
    { key: "signature", width: 15 },
    { key: "remarks", width: 15 }
  ];

  // Fonts
  const muolFont = { name: "Khmer OS Muol Light", size: 11 };
  const battambangFont = { name: "Khmer OS Battambang", size: 10 };
  const battambangBold = { name: "Khmer OS Battambang", size: 10, bold: true };

  // Row 1
  worksheet.mergeCells("A1:D1");
  worksheet.getCell("A1").value = "មន្ទីរអប់រំ យុវជន និង កីឡាខេត្តបាត់ដំបង";
  worksheet.getCell("A1").font = muolFont;
  worksheet.getCell("A1").alignment = { horizontal: "center" };

  worksheet.mergeCells("F1:J1");
  worksheet.getCell("F1").value = "ព្រះរាជាណាចក្រកម្ពុជា";
  worksheet.getCell("F1").font = { name: "Khmer OS Muol Light", size: 14 };
  worksheet.getCell("F1").alignment = { horizontal: "center" };

  // Row 2
  worksheet.mergeCells("A2:D2");
  worksheet.getCell("A2").value = "ការិយាល័យអប់រំយុវជន និងកីឡាស្រុករតនមណ្ឌល";
  worksheet.getCell("A2").font = muolFont;
  worksheet.getCell("A2").alignment = { horizontal: "center" };

  worksheet.mergeCells("F2:J2");
  worksheet.getCell("F2").value = "ជាតិ សាសនា ព្រះមហាក្សត្រ";
  worksheet.getCell("F2").font = { name: "Khmer OS Muol Light", size: 12 };
  worksheet.getCell("F2").alignment = { horizontal: "center" };

  // Row 3
  worksheet.mergeCells("A3:D3");
  worksheet.getCell("A3").value = "អនុវិទ្យាល័យ ផ្លូវមាស";
  worksheet.getCell("A3").font = muolFont;
  worksheet.getCell("A3").alignment = { horizontal: "center" };

  worksheet.mergeCells("F3:J3");
  worksheet.getCell("F3").value = "✤ ✤ ✤";
  worksheet.getCell("F3").font = battambangFont;
  worksheet.getCell("F3").alignment = { horizontal: "center" };

  // Row 4 (Title)
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.mergeCells(`A5:M5`);
  worksheet.getCell("A5").value = "បញ្ជីរាយនាមមន្ត្រីរាជការ និងបុគ្គលិកអប់រំនៃអនុវិទ្យាល័យផ្លូវមាស ក្នុងឆ្នាំសិក្សា ២០២៤-២០២៥";
  worksheet.getCell("A5").font = { name: "Khmer OS Muol Light", size: 12 };
  worksheet.getCell("A5").alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(5).height = 30;

  // Row 6 (Headers)
  const headerRow = worksheet.addRow([
    "ល.រ",
    "អត្តលេខមន្ត្រីរាជការ",
    "គោត្តនាម និងនាម",
    "ភេទ",
    "ថ្ងៃខែឆ្នាំកំណើត",
    "តួនាទី",
    "ក្របខ័ណ្ឌ",
    "ឯកទេស",
    "មុខវិជ្ជាបង្រៀនបន្ថែម",
    "ម៉ោងកំណត់\nក្នុង១សប្ដាហ៍",
    "ម៉ោងបន្ថែម\nក្នុង១សប្ដាហ៍",
    "ហត្ថលេខា",
    "ផ្សេងៗ"
  ]);

  headerRow.height = 40;
  headerRow.eachCell((cell) => {
    cell.font = battambangBold;
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
  });

  // Data rows
  teachers.forEach((t, i) => {
    const row = worksheet.addRow({
      index: i + 1,
      officerId: t.officerId || "",
      name: t.nameKh || "",
      gender: t.gender === "male" ? "ប្រុស" : t.gender === "female" ? "ស្រី" : (t.gender || ""),
      dob: t.dob || "",
      position: t.position || "",
      framework: t.framework || "",
      specialty: t.subjectKh || "",
      addSubjects: t.additionalSubjects || "",
      desigHours: t.designatedTeachingHours || "",
      addHours: t.additionalTeachingHours || "",
      signature: "",
      remarks: t.remarks || "",
    });

    row.eachCell((cell) => {
      cell.font = battambangFont;
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
    });

    // nameKh should be left aligned
    row.getCell(3).alignment = { horizontal: "left", vertical: "middle" };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "Teachers_List.xlsx");
};

export const exportTeacherProfileToExcel = async (teacher: any) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ប្រវត្តិរូបគ្រូបង្រៀន", {
    pageSetup: { orientation: "portrait", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    views: [{ showGridLines: false }] // Hide gridlines for a clean document look
  });

  // Setup column widths
  worksheet.columns = [
    { width: 25 }, // A
    { width: 15 }, // B
    { width: 15 }, // C
    { width: 25 }, // D
    { width: 15 }, // E
    { width: 15 }  // F
  ];

  // Header
  worksheet.mergeCells("A1:F1");
  const header1 = worksheet.getCell("A1");
  header1.value = "ព្រះរាជាណាចក្រកម្ពុជា";
  header1.font = { name: "Khmer OS Muol Light", size: 14 };
  header1.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(1).height = 30;

  worksheet.mergeCells("A2:F2");
  const header2 = worksheet.getCell("A2");
  header2.value = "ជាតិ សាសនា ព្រះមហាក្សត្រ";
  header2.font = { name: "Khmer OS Muol Light", size: 14 }; 
  header2.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(2).height = 30;

  worksheet.mergeCells("A3:F3");
  const header3 = worksheet.getCell("A3");
  header3.value = "✤ ✤ ✤";
  header3.font = { name: "Khmer OS Battambang", size: 14 };
  header3.alignment = { horizontal: "center", vertical: "top" };
  worksheet.getRow(3).height = 20;

  worksheet.mergeCells("A5:F5");
  const title = worksheet.getCell("A5");
  title.value = "ប្រវត្តិរូបសង្ខេបមន្ត្រីរាជការ (គ្រូបង្រៀន)";
  title.font = { name: "Khmer OS Muol Light", size: 14, underline: true };
  title.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(5).height = 30;

  let rowIdx = 7;
  const thinBorder: any = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };

  const addSectionHeader = (titleText: string) => {
    worksheet.mergeCells(`A${rowIdx}:F${rowIdx}`);
    const cell = worksheet.getCell(`A${rowIdx}`);
    cell.value = titleText;
    cell.font = { name: "Khmer OS Muol Light", size: 12 };
    // A nice subtle grey-blue background for modern look
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
    cell.border = thinBorder;
    cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    worksheet.getRow(rowIdx).height = 30;
    rowIdx++;
  };

  const addFieldRow = (label1: string, value1: string, label2?: string, value2?: string) => {
    // Label 1
    worksheet.getCell(`A${rowIdx}`).value = label1;
    worksheet.getCell(`A${rowIdx}`).font = { name: "Khmer OS Battambang", bold: true };
    worksheet.getCell(`A${rowIdx}`).border = thinBorder;
    worksheet.getCell(`A${rowIdx}`).alignment = { vertical: "middle", wrapText: true, indent: 1 };

    // Value 1 (Merged B & C)
    worksheet.mergeCells(`B${rowIdx}:C${rowIdx}`);
    worksheet.getCell(`B${rowIdx}`).value = value1;
    worksheet.getCell(`B${rowIdx}`).font = { name: "Khmer OS Battambang" };
    worksheet.getCell(`B${rowIdx}`).border = thinBorder;
    worksheet.getCell(`C${rowIdx}`).border = thinBorder;
    worksheet.getCell(`B${rowIdx}`).alignment = { vertical: "middle", wrapText: true, horizontal: "left", indent: 1 };

    // Label 2
    worksheet.getCell(`D${rowIdx}`).value = label2 || "";
    worksheet.getCell(`D${rowIdx}`).font = { name: "Khmer OS Battambang", bold: true };
    worksheet.getCell(`D${rowIdx}`).border = thinBorder;
    worksheet.getCell(`D${rowIdx}`).alignment = { vertical: "middle", wrapText: true, indent: 1 };

    // Value 2 (Merged E & F)
    worksheet.mergeCells(`E${rowIdx}:F${rowIdx}`);
    worksheet.getCell(`E${rowIdx}`).value = value2 || "";
    worksheet.getCell(`E${rowIdx}`).font = { name: "Khmer OS Battambang" };
    worksheet.getCell(`E${rowIdx}`).border = thinBorder;
    worksheet.getCell(`F${rowIdx}`).border = thinBorder;
    worksheet.getCell(`E${rowIdx}`).alignment = { vertical: "middle", wrapText: true, horizontal: "left", indent: 1 };

    worksheet.getRow(rowIdx).height = 28;
    rowIdx++;
  };

  const addFullRow = (label: string, value: string) => {
    worksheet.getCell(`A${rowIdx}`).value = label;
    worksheet.getCell(`A${rowIdx}`).font = { name: "Khmer OS Battambang", bold: true };
    worksheet.getCell(`A${rowIdx}`).border = thinBorder;
    worksheet.getCell(`A${rowIdx}`).alignment = { vertical: "middle", wrapText: true, indent: 1 };

    worksheet.mergeCells(`B${rowIdx}:F${rowIdx}`);
    worksheet.getCell(`B${rowIdx}`).value = value;
    worksheet.getCell(`B${rowIdx}`).font = { name: "Khmer OS Battambang" };
    worksheet.getCell(`B${rowIdx}`).border = thinBorder;
    worksheet.getCell(`C${rowIdx}`).border = thinBorder;
    worksheet.getCell(`D${rowIdx}`).border = thinBorder;
    worksheet.getCell(`E${rowIdx}`).border = thinBorder;
    worksheet.getCell(`F${rowIdx}`).border = thinBorder;
    worksheet.getCell(`B${rowIdx}`).alignment = { vertical: "middle", wrapText: true, horizontal: "left", indent: 1 };
    
    // Auto-adjust height based on length
    if (value && value.length > 80) {
      worksheet.getRow(rowIdx).height = 45;
    } else {
      worksheet.getRow(rowIdx).height = 28;
    }
    
    rowIdx++;
  };

  // Section 1: Personal Info
  addSectionHeader("១. ព័ត៌មានផ្ទាល់ខ្លួន");
  addFieldRow("អត្តលេខ", teacher.officerId || "", "ឈ្មោះ (ខ្មែរ)", teacher.nameKh || "");
  addFieldRow("ឈ្មោះ (ឡាតាំង)", teacher.nameEn || "", "ភេទ", teacher.gender === "male" ? "ប្រុស" : teacher.gender === "female" ? "ស្រី" : (teacher.gender || ""));
  addFieldRow("ថ្ងៃខែឆ្នាំកំណើត", teacher.dob || "", "ស្ថានភាពគ្រួសារ", teacher.familyStatus || "");
  addFieldRow("លេខទូរស័ព្ទ", teacher.phone || "", "អ៊ីមែល", teacher.email || "");
  
  let parsedAddress = "";
  try {
    const data = JSON.parse(teacher.address || "{}");
    parsedAddress = [data.village, data.commune, data.district, data.province].filter(Boolean).join(", ");
  } catch {
    parsedAddress = teacher.address || "";
  }
  addFullRow("អាសយដ្ឋានបច្ចុប្បន្ន", parsedAddress);
  rowIdx++; // Empty row separator

  // Section 2: Education
  addSectionHeader("២. កម្រិតវប្បធម៌ និងការអប់រំ");
  addFieldRow("កម្រិតវប្បធម៌", teacher.educationLevel || "", "ក្របខ័ណ្ឌ", teacher.framework || "");
  addFullRow("បរិញ្ញាបត្រ/អនុបណ្ឌិត/បណ្ឌិត", teacher.degreeInfo || "");
  addFullRow("សញ្ញាបត្រគរុកោសល្យ", teacher.pedagogyInfo || "");
  addFullRow("វគ្គបណ្តុះបណ្តាលបន្ថែម", teacher.trainingInfo || "");
  rowIdx++;

  // Section 3: Work Experience
  addSectionHeader("៣. បទពិសោធន៍ការងារ");
  addFieldRow("តួនាទី", teacher.position || "", "ថ្ងៃបម្រើការងារ", teacher.employmentDate || "");
  addFieldRow("មុខវិជ្ជាបង្រៀន", teacher.subjectKh || "", "មុខវិជ្ជាបន្ថែម", teacher.additionalSubjects || "");
  addFullRow("បទពិសោធន៍ការងារ", teacher.workExperience || "");
  rowIdx++;

  // Section 4: Skills
  addSectionHeader("៤. ជំនាញ និងចំណេះដឹងទូទៅ");
  addFullRow("ជំនាញបង្រៀន", teacher.teachingSkills || "");
  addFullRow("ជំនាញបច្ចេកវិទ្យា", teacher.techSkills || "");
  addFullRow("ភាសាបរទេស", teacher.languages || "");
  rowIdx++;

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Teacher_Profile_${teacher.nameEn || "Export"}.xlsx`);
};

export const exportStudentProfileToExcel = async (student: any) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ប្រវត្តិរូបសិស្ស", {
    pageSetup: { orientation: "landscape", paperSize: 9 }
  });

  worksheet.columns = [
    { width: 5 }, { width: 20 }, { width: 25 }, { width: 5 }, { width: 20 }, { width: 25 }
  ];

  // Header
  worksheet.mergeCells("A1:F1");
  const header1 = worksheet.getCell("A1");
  header1.value = "ព្រះរាជាណាចក្រកម្ពុជា";
  header1.font = { name: "Khmer OS Muol Light", size: 16 };
  header1.alignment = { horizontal: "center" };

  worksheet.mergeCells("A2:F2");
  const header2 = worksheet.getCell("A2");
  header2.value = "ជាតិ សាសនា ព្រះមហាក្សត្រ";
  header2.font = { name: "Khmer OS Muol Light", size: 14 };
  header2.alignment = { horizontal: "center" };

  worksheet.mergeCells("A4:F4");
  const title = worksheet.getCell("A4");
  title.value = "ប្រវត្តិរូបសង្ខេបសិស្សានុសិស្ស";
  title.font = { name: "Khmer OS Muol Light", size: 14, underline: true };
  title.alignment = { horizontal: "center" };

  const fields = [
    { label: "អត្តលេខសិស្ស", value: student.studentId || "" },
    { label: "ឈ្មោះ (ខ្មែរ)", value: student.nameKh || "" },
    { label: "ឈ្មោះ (ឡាតាំង)", value: student.nameEn || "" },
    { label: "ភេទ", value: student.gender === "male" ? "ប្រុស" : student.gender === "female" ? "ស្រី" : (student.gender || "") },
    { label: "ថ្នាក់រៀន", value: student.grade || "" },
    { label: "ឆ្នាំចូលរៀន", value: student.enrollmentYear || "" },
    { label: "លេខទូរស័ព្ទ", value: student.phone || "" },
    { label: "លេខទូរស័ព្ទអាណាព្យាបាល", value: student.parentPhone || "" },
    { label: "ស្ថានភាពគ្រួសារ", value: student.familyStatus || "" },
    { label: "ស្ថានភាពសិស្ស", value: student.status || "" },
    { label: "អាសយដ្ឋាន", value: student.address || "" },
    { label: "ជីវប្រវត្តិសង្ខេប", value: student.biography || "" }
  ];

  let rowIdx = 6;
  for (let i = 0; i < fields.length; i += 2) {
    const field1 = fields[i];
    const field2 = fields[i + 1] || { label: "", value: "" };

    worksheet.getCell(`B${rowIdx}`).value = field1.label + " :";
    worksheet.getCell(`B${rowIdx}`).font = { name: "Khmer OS Battambang", bold: true };
    worksheet.getCell(`C${rowIdx}`).value = field1.value;
    worksheet.getCell(`C${rowIdx}`).font = { name: "Khmer OS Battambang" };

    if (field2.label) {
      worksheet.getCell(`E${rowIdx}`).value = field2.label + " :";
      worksheet.getCell(`E${rowIdx}`).font = { name: "Khmer OS Battambang", bold: true };
      worksheet.getCell(`F${rowIdx}`).value = field2.value;
      worksheet.getCell(`F${rowIdx}`).font = { name: "Khmer OS Battambang" };
    }
    rowIdx++;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Student_Profile_${student.nameEn || "Export"}.xlsx`);
};
