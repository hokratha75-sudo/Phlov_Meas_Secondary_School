import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

function getColLetter(colIdx: number): string {
  let temp = colIdx;
  let letter = '';
  while (temp > 0) {
    let rem = (temp - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    temp = Math.floor((temp - 1) / 26);
  }
  return letter;
}

export type ReportType = 
  | 'monthly_summary' 
  | 'monthly_rank' 
  | 'semester_summary' 
  | 'semester_rank' 
  | 'semester_exam' 
  | 'annual_summary'
  | 'annual_rank' 
  | 'diagnostic_test' 
  | 'all_subjects_recording';

export async function exportToMoEYSExcel(data: {
  month: string;
  className: string;
  year: string;
  students: any[];
  subjectConfigs?: any[]; 
  reportType?: ReportType;
}) {
  const activeSubjects = data.subjectConfigs || [];
  const totalCoeff = activeSubjects.reduce((sum, s) => sum + (s.coeff || 1), 0);
  const students = [...data.students];
  const type = data.reportType || 'monthly_summary';

  // Sort students by average descending for ranking types, otherwise keep original order
  if (['monthly_rank', 'semester_rank', 'annual_rank', 'diagnostic_test'].includes(type)) {
    students.sort((a, b) => (b.avg || 0) - (a.avg || 0));
  }

  const workbook = new ExcelJS.Workbook();
  const sheetName = {
    'monthly_summary': 'បញ្ជីស្រង់ពិន្ទុប្រចាំខែ',
    'monthly_rank': 'បញ្ជីចំណាត់ថ្នាក់ប្រចាំខែ',
    'semester_summary': 'បញ្ជីស្រង់ពិន្ទុប្រចាំឆមាស',
    'semester_rank': 'បញ្ជីចំណាត់ថ្នាក់ឆមាស',
    'semester_exam': 'បញ្ជីពិន្ទុប្រឡងឆមាស',
    'annual_summary': 'បញ្ជីស្រង់ពិន្ទុប្រចាំឆ្នាំ',
    'annual_rank': 'បញ្ជីចំណាត់ថ្នាក់ប្រចាំឆ្នាំ',
    'diagnostic_test': 'លទ្ធផលតេស្តដើមឆ្នាំ',
    'all_subjects_recording': 'បញ្ជីសម្រង់ពិន្ទុគ្រប់មុខវិជ្ជា'
  }[type];

  const isRankingReport = ['monthly_rank', 'semester_rank', 'annual_rank'].includes(type);

  if (isRankingReport) {
    // -------------------------------------------------------------
    // TWO-COLUMN STUDENT RANKING LAYOUT
    // -------------------------------------------------------------
    const worksheet = workbook.addWorksheet(sheetName, {
      pageSetup: { 
        paperSize: 9, // A4
        orientation: 'portrait', 
        margins: { left: 0.2, right: 0.2, top: 0.2, bottom: 0.2, header: 0, footer: 0 },
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0
      }
    });

    const columns = [
      { key: "no_l", width: 6 },
      { key: "name_l", width: 24 },
      { key: "gender_l", width: 6 },
      { key: "total_l", width: 10 },
      { key: "avg_l", width: 12 },
      { key: "rank_l", width: 10 },
      { key: "grade_l", width: 8 },
      { key: "result_l", width: 10 },
      { key: "divider", width: 4 },
      { key: "no_r", width: 6 },
      { key: "name_r", width: 24 },
      { key: "gender_r", width: 6 },
      { key: "total_r", width: 10 },
      { key: "avg_r", width: 12 },
      { key: "rank_r", width: 10 },
      { key: "grade_r", width: 8 },
      { key: "result_r", width: 10 }
    ];
    worksheet.columns = columns;

    // Administrative Header
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = 'ក្រសួងអប់រំ យុវជន និងកីឡា';
    worksheet.getCell('A1').font = { name: 'Khmer OS Muol Light', size: 10 };
    worksheet.getCell('A1').alignment = { horizontal: 'left' };

    worksheet.mergeCells('A2:F2');
    worksheet.getCell('A2').value = 'មន្ទីរអប់រំ យុវជន និងកីឡាខេត្តបាត់ដំបង';
    worksheet.getCell('A2').font = { name: 'Khmer OS Muol Light', size: 10 };
    worksheet.getCell('A2').alignment = { horizontal: 'left' };

    worksheet.mergeCells('A3:F3');
    worksheet.getCell('A3').value = 'វិទ្យាល័យ ផ្លូវមាស';
    worksheet.getCell('A3').font = { name: 'Khmer OS Muol Light', size: 10 };
    worksheet.getCell('A3').alignment = { horizontal: 'left' };

    worksheet.mergeCells('L1:Q1');
    worksheet.getCell('L1').value = 'ព្រះរាជាណាចក្រកម្ពុជា';
    worksheet.getCell('L1').font = { name: 'Khmer OS Muol Light', size: 10 };
    worksheet.getCell('L1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('L2:Q2');
    worksheet.getCell('L2').value = 'ជាតិ សាសនា ព្រះមហាក្សត្រ';
    worksheet.getCell('L2').font = { name: 'Khmer OS Muol Light', size: 10 };
    worksheet.getCell('L2').alignment = { horizontal: 'center' };

    worksheet.mergeCells('L3:Q3');
    worksheet.getCell('L3').value = '3';
    worksheet.getCell('L3').font = { name: 'Tacteing', size: 24 };
    worksheet.getCell('L3').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(3).height = 24;

    // Title Row (Row 4 & 5)
    worksheet.mergeCells('A4:Q4');
    const titleCell = worksheet.getCell('A4');
    const titleString = (({
      'monthly_rank': `បញ្ជីចំណាត់ថ្នាក់សិស្សប្រចាំខែ ${data.month}`,
      'semester_rank': `បញ្ជីចំណាត់ថ្នាក់សិស្សប្រចាំ ${data.month}`,
      'annual_rank': `បញ្ជីចំណាត់ថ្នាក់សិស្សប្រចាំឆ្នាំសិក្សា ${data.year}`
    } as Record<string, string>)[type]) || `បញ្ជីចំណាត់ថ្នាក់សិស្ស`;

    titleCell.value = titleString;
    titleCell.font = { name: 'Khmer OS Muol Light', size: 12, color: { argb: 'FFC00000' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(4).height = 28;

    worksheet.mergeCells('A5:Q5');
    const subTitleCell = worksheet.getCell('A5');
    subTitleCell.value = `ឆ្នាំសិក្សា ${data.year}  |  ថ្នាក់ទី: ${data.className}`;
    subTitleCell.font = { name: 'Khmer OS Siemreap', size: 10, italic: true };
    subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(5).height = 20;

    // Table Headers (Row 6)
    worksheet.getRow(6).height = 28;
    const headerBg = 'FFEAEAEA';
    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    const leftHeaders = ['ល.រ', 'គោត្តនាម-នាម', 'ភេទ', 'សរុប', 'មធ្យមភាគ', 'ចំ.ថ្នាក់', 'និទ្ទេស', 'មូ.វិ'];
    leftHeaders.forEach((label, idx) => {
      const colLetter = getColLetter(1 + idx);
      const cell = worksheet.getCell(`${colLetter}6`);
      cell.value = label;
      cell.font = { name: 'Khmer OS Muol Light', size: 9 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerBg } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = thinBorder;
    });

    // Divider Column I has no border and no fill
    worksheet.getCell('I6').value = '';

    const rightHeaders = ['ល.រ', 'គោត្តនាម-នាម', 'ភេទ', 'សរុប', 'មធ្យមភាគ', 'ចំ.ថ្នាក់', 'និទ្ទេស', 'មូ.វិ'];
    rightHeaders.forEach((label, idx) => {
      const colLetter = getColLetter(10 + idx);
      const cell = worksheet.getCell(`${colLetter}6`);
      cell.value = label;
      cell.font = { name: 'Khmer OS Muol Light', size: 9 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerBg } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = thinBorder;
    });

    // Split students
    const half = Math.ceil(students.length / 2);
    const leftGroup = students.slice(0, half);
    const rightGroup = students.slice(half);

    for (let i = 0; i < half; i++) {
      const rowNum = 7 + i;
      const row = worksheet.getRow(rowNum);
      row.height = 24;

      // --- Left Block ---
      const lStudent = leftGroup[i];
      if (lStudent) {
        row.getCell('A').value = i + 1;
        row.getCell('B').value = lStudent.nameKh || lStudent.nameEn || '';
        row.getCell('C').value = ['female', 'Female', 'ស', 'f', 'F'].includes(lStudent.gender) ? 'ស' : 'ប';
        
        row.getCell('D').value = typeof lStudent.total === 'number' ? Math.round(lStudent.total * 100) / 100 : '';
        row.getCell('E').value = typeof lStudent.avg === 'number' ? Math.round(lStudent.avg * 100) / 100 : '';
        row.getCell('F').value = lStudent.rank;
        row.getCell('G').value = { formula: `IF(E${rowNum}>=45,"A",IF(E${rowNum}>=40,"B",IF(E${rowNum}>=35,"C",IF(E${rowNum}>=30,"D",IF(E${rowNum}>=25,"E","F")))))` };
        row.getCell('H').value = { formula: `IF(E${rowNum}>=25,"ជាប់","ធ្លាក់")` };

        // Borders and fonts for Left Block
        for (let colIdx = 1; colIdx <= 8; colIdx++) {
          const colLetter = getColLetter(colIdx);
          const cell = row.getCell(colLetter);
          cell.border = thinBorder;
          cell.font = { name: 'Khmer OS Siemreap', size: 10 };
          if (colIdx === 2) {
            cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
          } else {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
          // Bold for totals, averages, rank, grade, result
          if (colIdx >= 4) {
            cell.font = { name: 'Khmer OS Siemreap', size: 10, bold: true };
          }
        }
      }

      // --- Divider ---
      row.getCell('I').value = '';

      // --- Right Block ---
      const rStudent = rightGroup[i];
      if (rStudent) {
        row.getCell('J').value = half + i + 1;
        row.getCell('K').value = rStudent.nameKh || rStudent.nameEn || '';
        row.getCell('L').value = ['female', 'Female', 'ស', 'f', 'F'].includes(rStudent.gender) ? 'ស' : 'ប';
        
        row.getCell('M').value = typeof rStudent.total === 'number' ? Math.round(rStudent.total * 100) / 100 : '';
        row.getCell('N').value = typeof rStudent.avg === 'number' ? Math.round(rStudent.avg * 100) / 100 : '';
        row.getCell('O').value = rStudent.rank;
        row.getCell('P').value = { formula: `IF(N${rowNum}>=45,"A",IF(N${rowNum}>=40,"B",IF(N${rowNum}>=35,"C",IF(N${rowNum}>=30,"D",IF(N${rowNum}>=25,"E","F")))))` };
        row.getCell('Q').value = { formula: `IF(N${rowNum}>=25,"ជាប់","ធ្លាក់")` };

        // Borders and fonts for Right Block
        for (let colIdx = 10; colIdx <= 17; colIdx++) {
          const colLetter = getColLetter(colIdx);
          const cell = row.getCell(colLetter);
          cell.border = thinBorder;
          cell.font = { name: 'Khmer OS Siemreap', size: 10 };
          if (colIdx === 11) {
            cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
          } else {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
          // Bold for totals, averages, rank, grade, result
          if (colIdx >= 13) {
            cell.font = { name: 'Khmer OS Siemreap', size: 10, bold: true };
          }
        }
      }
    }

    // Footer Sign-offs
    const footerRow = 7 + half + 2;
    worksheet.getRow(footerRow).height = 20;
    worksheet.getRow(footerRow + 1).height = 20;

    worksheet.mergeCells(`B${footerRow}:D${footerRow}`);
    worksheet.getCell(`B${footerRow}`).value = 'បានឃើញ និងឯកភាព';
    worksheet.getCell(`B${footerRow}`).font = { name: 'Khmer OS Siemreap', size: 10, bold: true };
    worksheet.getCell(`B${footerRow}`).alignment = { horizontal: 'center' };

    worksheet.mergeCells(`B${footerRow + 1}:D${footerRow + 1}`);
    worksheet.getCell(`B${footerRow + 1}`).value = 'នាយកសាលា';
    worksheet.getCell(`B${footerRow + 1}`).font = { name: 'Khmer OS Siemreap', size: 10, bold: true };
    worksheet.getCell(`B${footerRow + 1}`).alignment = { horizontal: 'center' };

    worksheet.mergeCells(`M${footerRow}:P${footerRow}`);
    worksheet.getCell(`M${footerRow}`).value = `បាត់ដំបង, ថ្ងៃទី..... ខែ..... ឆ្នាំ ២០២...`;
    worksheet.getCell(`M${footerRow}`).font = { name: 'Khmer OS Siemreap', size: 10, italic: true };
    worksheet.getCell(`M${footerRow}`).alignment = { horizontal: 'center' };

    worksheet.mergeCells(`M${footerRow + 1}:P${footerRow + 1}`);
    worksheet.getCell(`M${footerRow + 1}`).value = 'គ្រូទទួលបន្ទុកថ្នាក់';
    worksheet.getCell(`M${footerRow + 1}`).font = { name: 'Khmer OS Siemreap', size: 10, bold: true };
    worksheet.getCell(`M${footerRow + 1}`).alignment = { horizontal: 'center' };

    // Write Buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${sheetName}_${data.className}_${data.year}.xlsx`);
    return;
  }

  // Landscape is preferred for reports with many subject columns
  const isLandscape = ['monthly_summary', 'semester_summary', 'semester_exam', 'annual_summary', 'diagnostic_test', 'all_subjects_recording'].includes(type);

  const worksheet = workbook.addWorksheet(sheetName, {
    pageSetup: { 
      paperSize: 9, // A4
      orientation: isLandscape ? 'landscape' : 'portrait', 
      margins: { left: 0.2, right: 0.2, top: 0.2, bottom: 0.2, header: 0, footer: 0 },
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    }
  });

  const columns = [
    { key: "no", width: 6 },
    { key: "id", width: 12 },
    { key: "name", width: 30 },
    { key: "gender", width: 6 },
    ...activeSubjects.map((s) => ({ key: `sub_${s.id}`, width: 14 })),
    { key: "total", width: 12 },
    { key: "avg", width: 12 },
    { key: "rank", width: 12 },
    { key: "grade", width: 10 },
  ];
  worksheet.columns = columns;

  const totalCols = 4 + activeSubjects.length + 4;
  const lastCol = getColLetter(totalCols);

  // Administrative Header - Dynamic Motto Block on the right side
  const rightStartIdx = Math.max(5, totalCols - 3);
  const rightStart = getColLetter(rightStartIdx);

  // Merge left administrative cells
  worksheet.mergeCells('A1:F1');
  worksheet.getCell('A1').value = 'ក្រសួងអប់រំ យុវជន និងកីឡា';
  worksheet.getCell('A1').font = { name: 'Khmer OS Muol Light', size: 10 };
  worksheet.getCell('A1').alignment = { horizontal: 'left' };

  worksheet.mergeCells('A2:F2');
  worksheet.getCell('A2').value = 'មន្ទីរអប់រំ យុវជន និងកីឡាខេត្តបាត់ដំបង';
  worksheet.getCell('A2').font = { name: 'Khmer OS Muol Light', size: 10 };
  worksheet.getCell('A2').alignment = { horizontal: 'left' };

  worksheet.mergeCells('A3:F3');
  worksheet.getCell('A3').value = 'វិទ្យាល័យ ផ្លូវមាស';
  worksheet.getCell('A3').font = { name: 'Khmer OS Muol Light', size: 10 };
  worksheet.getCell('A3').alignment = { horizontal: 'left' };

  // Merge right administrative motto cells
  worksheet.mergeCells(`${rightStart}1:${lastCol}1`);
  worksheet.getCell(`${rightStart}1`).value = 'ព្រះរាជាណាចក្រកម្ពុជា';
  worksheet.getCell(`${rightStart}1`).font = { name: 'Khmer OS Muol Light', size: 10 };
  worksheet.getCell(`${rightStart}1`).alignment = { horizontal: 'center' };

  worksheet.mergeCells(`${rightStart}2:${lastCol}2`);
  worksheet.getCell(`${rightStart}2`).value = 'ជាតិ សាសនា ព្រះមហាក្សត្រ';
  worksheet.getCell(`${rightStart}2`).font = { name: 'Khmer OS Muol Light', size: 10 };
  worksheet.getCell(`${rightStart}2`).alignment = { horizontal: 'center' };

  worksheet.mergeCells(`${rightStart}3:${lastCol}3`);
  worksheet.getCell(`${rightStart}3`).value = '3';
  worksheet.getCell(`${rightStart}3`).font = { name: 'Tacteing', size: 24 };
  worksheet.getCell(`${rightStart}3`).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(3).height = 24;

  // Title Row (Row 4 & 5)
  worksheet.mergeCells(`A4:${lastCol}4`);
  const titleCell = worksheet.getCell('A4');

  const titleString = {
    'monthly_summary': `បញ្ជីស្រង់ពិន្ទុសិស្សប្រចាំខែ ${data.month}`,
    'monthly_rank': `បញ្ជីចំណាត់ថ្នាក់សិស្សប្រចាំខែ ${data.month}`,
    'semester_summary': `បញ្ជីស្រង់ពិន្ទុសិស្សប្រចាំ ${data.month}`,
    'semester_rank': `បញ្ជីចំណាត់ថ្នាក់សិស្សប្រចាំ ${data.month}`,
    'semester_exam': `បញ្ជីស្រង់ពិន្ទុប្រឡងឆមាសប្រចាំ ${data.month}`,
    'annual_summary': `បញ្ជីស្រង់ពិន្ទុសិស្សប្រចាំឆ្នាំសិក្សា ${data.year}`,
    'annual_rank': `បញ្ជីចំណាត់ថ្នាក់សិស្សប្រចាំឆ្នាំសិក្សា ${data.year}`,
    'diagnostic_test': `បញ្ជីលទ្ធផលតេស្តដើមឆ្នាំសិក្សា ${data.year}`,
    'all_subjects_recording': `បញ្ជីសម្រង់ពិន្ទុសិស្សគ្រប់មុខវិជ្ជា`
  }[type];

  titleCell.value = titleString;
  titleCell.font = { name: 'Khmer OS Muol Light', size: 12, color: { argb: 'FFC00000' } }; // Official Dark Red
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(4).height = 28;

  worksheet.mergeCells(`A5:${lastCol}5`);
  const subTitleCell = worksheet.getCell('A5');
  subTitleCell.value = `ឆ្នាំសិក្សា ${data.year}  |  ថ្នាក់ទី: ${data.className}`;
  subTitleCell.font = { name: 'Khmer OS Siemreap', size: 10, italic: true };
  subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(5).height = 20;

  // Row 7 & 8: Official Two-row Merged Headers
  worksheet.getRow(7).height = 42; // Increased to 42 for subscript room!
  worksheet.getRow(8).height = 24; // Increased to 24 for clean coefficient layout!

  const headerBg = 'FFEAEAEA'; // Premium subtle light gray
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  const styleMergedHeader = (colLetter: string, label: string) => {
    worksheet.mergeCells(`${colLetter}7:${colLetter}8`);
    const cell = worksheet.getCell(`${colLetter}7`);
    cell.value = label;
    cell.font = { name: 'Khmer OS Muol Light', size: 9 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerBg } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorder;
    
    // Apply borders and fill to the bottom cell as well so Excel draws borders correctly
    const bottomCell = worksheet.getCell(`${colLetter}8`);
    bottomCell.border = thinBorder;
    bottomCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerBg } };
  };

  // Base columns
  styleMergedHeader('A', 'ល.រ');
  styleMergedHeader('B', 'អត្តលេខ');
  styleMergedHeader('C', 'គោត្តនាម និង នាម');
  styleMergedHeader('D', 'ភេទ');

  // Subjects Columns
  activeSubjects.forEach((sub, idx) => {
    const colLetter = getColLetter(5 + idx);
    const topCell = worksheet.getCell(`${colLetter}7`);
    
    topCell.value = sub.km;
    topCell.font = { name: 'Khmer OS Muol Light', size: 9 };
    topCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerBg } };
    topCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    topCell.border = thinBorder;

    const bottomCell = worksheet.getCell(`${colLetter}8`);
    bottomCell.value = `មេគុណ ${sub.coeff || 1}`;
    bottomCell.font = { name: 'Khmer OS Siemreap', size: 8, italic: true };
    bottomCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerBg } };
    bottomCell.alignment = { horizontal: 'center', vertical: 'middle' };
    bottomCell.border = thinBorder;
  });

  // Summary columns
  const lastScoreColIdx = 4 + activeSubjects.length;
  const lastScoreCol = getColLetter(lastScoreColIdx);
  const totalCol = getColLetter(lastScoreColIdx + 1);
  const avgCol = getColLetter(lastScoreColIdx + 2);
  const rankCol = getColLetter(lastScoreColIdx + 3);
  const gradeCol = getColLetter(lastScoreColIdx + 4);

  styleMergedHeader(totalCol, 'សរុប');
  styleMergedHeader(avgCol, 'មធ្យមភាគ');
  styleMergedHeader(rankCol, 'ចំណាត់ថ្នាក់');
  styleMergedHeader(gradeCol, 'និទ្ទេស');

  // Data Rows (start from Row 9)
  students.forEach((s, idx) => {
    const rowNum = 9 + idx;
    const row = worksheet.getRow(rowNum);
    row.height = 24;

    row.getCell('A').value = idx + 1;
    row.getCell('B').value = s.studentId;
    
    // Left-aligned name with slight indent for premium readability
    const nameCell = row.getCell('C');
    nameCell.value = s.nameKh || s.nameEn || '';
    nameCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

    // Female gender marked as 'ស'
    row.getCell('D').value = ['female', 'Female', 'ស', 'f', 'F'].includes(s.gender) ? 'ស' : '';

    const sScores = s.scores || {};
    activeSubjects.forEach((sub, i) => {
      const colLetter = getColLetter(5 + i);
      const cell = row.getCell(colLetter);
      const val = sScores[sub.id];
      
      // If all_subjects_recording and score is not present, keep cell completely empty
      if (type === 'all_subjects_recording' && (val === undefined || val === null)) {
        cell.value = '';
      } else {
        cell.value = (typeof val === 'number' && !isNaN(val)) ? val : '';
      }
    });

    // Formulas for dynamic computations
    row.getCell(totalCol).value = { formula: `SUM(E${rowNum}:${lastScoreCol}${rowNum})` };
    row.getCell(avgCol).value = { formula: `${totalCol}${rowNum}/${totalCoeff || 1}` };
    row.getCell(rankCol).value = { 
      formula: `RANK(${avgCol}${rowNum}, $${avgCol}$9:$${avgCol}$${8 + students.length})` 
    };
    row.getCell(gradeCol).value = { 
      formula: `IF(${avgCol}${rowNum}>=45,"A",IF(${avgCol}${rowNum}>=40,"B",IF(${avgCol}${rowNum}>=35,"C",IF(${avgCol}${rowNum}>=30,"D",IF(${avgCol}${rowNum}>=25,"E","F")))))` 
    };

    // Apply strict fonts, alignments, and borders to all cells in the row
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = thinBorder;
      cell.font = { name: 'Khmer OS Siemreap', size: 10 };
      
      if (colNumber === 3) {
        // Name is left-aligned
      } else {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }

      // Bold style for summary columns
      if (colNumber > lastScoreColIdx) {
        cell.font = { name: 'Khmer OS Siemreap', size: 10, bold: true };
      }
    });
  });

  // Footer Sign-offs (placed 3 rows after the last student row)
  const footerRow = 9 + students.length + 2;
  worksheet.getRow(footerRow).height = 20;
  worksheet.getRow(footerRow + 1).height = 20;

  worksheet.getCell(`C${footerRow}`).value = 'បានឃើញ និងឯកភាព';
  worksheet.getCell(`C${footerRow}`).font = { name: 'Khmer OS Siemreap', size: 10, bold: true };
  worksheet.getCell(`C${footerRow}`).alignment = { horizontal: 'center' };

  worksheet.getCell(`C${footerRow + 1}`).value = 'នាយកសាលា';
  worksheet.getCell(`C${footerRow + 1}`).font = { name: 'Khmer OS Siemreap', size: 10, bold: true };
  worksheet.getCell(`C${footerRow + 1}`).alignment = { horizontal: 'center' };

  const rightFooterCol = getColLetter(Math.max(5, totalCols - 1));
  
  worksheet.getCell(`${rightFooterCol}${footerRow}`).value = `បាត់ដំបង, ថ្ងៃទី..... ខែ..... ឆ្នាំ ២០២...`;
  worksheet.getCell(`${rightFooterCol}${footerRow}`).font = { name: 'Khmer OS Siemreap', size: 10, italic: true };
  worksheet.getCell(`${rightFooterCol}${footerRow}`).alignment = { horizontal: 'center' };

  worksheet.getCell(`${rightFooterCol}${footerRow + 1}`).value = 'គ្រូទទួលបន្ទុកថ្នាក់';
  worksheet.getCell(`${rightFooterCol}${footerRow + 1}`).font = { name: 'Khmer OS Siemreap', size: 10, bold: true };
  worksheet.getCell(`${rightFooterCol}${footerRow + 1}`).alignment = { horizontal: 'center' };

  // Write Buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${sheetName}_${data.className}_${data.year}.xlsx`);
}


/**
 * Export Monthly Attendance Register to Excel
 * Matches MoEYS official format: daily P/A columns per school day, grouped by week.
 */
export async function exportAttendanceMonthly(data: {
  className: string;
  grade: string;
  month: string;       // e.g. "November"
  monthKh: string;     // e.g. "វិច្ឆិកា"
  year: string;        // e.g. "2024-2025"
  students: { id: number; studentId: string; nameKh: string; nameEn: string; gender: string }[];
  // attendance: map of studentId -> dayNumber -> { present, excused, unexcused }
  attendance?: Record<number, Record<number, { present: number; excused: number; unexcused: number }>>;
  schoolDays: number[]; // e.g. [1,2,3,...,26] — working days in the month
}) {
  const { className, grade, month, monthKh, year, students, schoolDays } = data;
  const attendance = data.attendance || {};

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('បញ្ជីវត្តមានប្រចាំខែ', {
    pageSetup: {
      paperSize: 9,
      orientation: 'landscape',
      margins: { left: 0.15, right: 0.15, top: 0.2, bottom: 0.2, header: 0, footer: 0 },
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    }
  });

  // ── Column widths ──────────────────────────────────────
  // Fixed: A=ល.រ(6), B=ID(12), C=ឈ្មោះ(25), D=ភេទ(6), E=ថ្នាក់(8)
  // Then for each school day: 2 cols (P, A) each width 4
  // Then summary: P(5), A(5), សសអ(10), Result(12)
  const fixedCols = [
    { width: 6 }, { width: 12 }, { width: 30 }, { width: 6 }, { width: 8 }
  ];
  const dayCols = schoolDays.flatMap(() => [{ width: 3.5 }, { width: 3.5 }, { width: 3.5 }]);
  const summaryCols = [{ width: 5 }, { width: 5 }, { width: 5 }, { width: 12 }, { width: 16 }];
  ws.columns = [...fixedCols, ...dayCols, ...summaryCols];

  const totalCols = 5 + schoolDays.length * 3 + 5;

  // Helper: column index (1-based) → Excel letter(s)
  const colLetter = (idx: number): string => {
    let s = '';
    while (idx > 0) {
      const rem = (idx - 1) % 26;
      s = String.fromCharCode(65 + rem) + s;
      idx = Math.floor((idx - 1) / 26);
    }
    return s;
  };

  const styleHeader = (cell: ExcelJS.Cell, bg = 'FF00B0F0') => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    cell.font = { name: 'Khmer OS Muol Light', size: 10, color: { argb: 'FF000000' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
  };

  const stylePink = (cell: ExcelJS.Cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCCC' } };
    cell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.font = { name: 'Khmer OS Siemreap', size: 10 };
  };

  // ── ROW 1-3: Admin Header ───────────────────────────────
  const lastCol = colLetter(totalCols);
  const midStart = colLetter(Math.floor(totalCols / 2) - 3);
  const midEnd = colLetter(Math.floor(totalCols / 2) + 3);
  const rightStart = colLetter(totalCols - 4);

  ws.mergeCells(`A1:F1`);
  ws.getCell('A1').value = 'ក្រសួងអប់រំ យុវជន និងកីឡា';
  ws.getCell('A1').font = { name: 'Khmer OS Muol Light', size: 12 };

  ws.mergeCells(`${rightStart}1:${lastCol}1`);
  ws.getCell(`${rightStart}1`).value = 'ព្រះរាជាណាចក្រកម្ពុជា';
  ws.getCell(`${rightStart}1`).font = { name: 'Khmer OS Muol Light', size: 12 };
  ws.getCell(`${rightStart}1`).alignment = { horizontal: 'center' };

  ws.mergeCells(`A2:F2`);
  ws.getCell('A2').value = 'មន្ទីរអប់រំ យុវជន និងកីឡា';
  ws.getCell('A2').font = { name: 'Khmer OS Muol Light', size: 12 };

  ws.mergeCells(`${rightStart}2:${lastCol}2`);
  ws.getCell(`${rightStart}2`).value = 'ជាតិ សាសនា ព្រះមហាក្សត្រ';
  ws.getCell(`${rightStart}2`).font = { name: 'Khmer OS Muol Light', size: 12 };
  ws.getCell(`${rightStart}2`).alignment = { horizontal: 'center' };

  ws.mergeCells(`A3:F3`);
  ws.getCell('A3').value = 'វិទ្យាល័យ ផ្លូវមាស';
  ws.getCell('A3').font = { name: 'Khmer OS Muol Light', size: 12 };

  ws.mergeCells(`${rightStart}3:${lastCol}3`);
  ws.getCell(`${rightStart}3`).value = '3';
  ws.getCell(`${rightStart}3`).font = { name: 'Tacteing', size: 28 };
  ws.getCell(`${rightStart}3`).alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(3).height = 24;

  // ── ROW 4: Title ───────────────────────────────────────
  ws.mergeCells(`A4:${lastCol}4`);
  const titleCell = ws.getCell(`A4`);
  titleCell.value = `បញ្ជីវត្តមានសិស្ស${monthKh}`;
  titleCell.font = { name: 'Khmer OS Muol Light', size: 12, color: { argb: 'FFFF0000' } };
  titleCell.alignment = { horizontal: 'center' };

  // ── ROW 5: Sub-title ───────────────────────────────────
  ws.mergeCells(`A5:${lastCol}5`);
  const subTitle = ws.getCell(`A5`);
  subTitle.value = `ឆ្នាំសិក្សា ${year}`;
  subTitle.font = { name: 'Khmer OS Siemreap', size: 10 };
  subTitle.alignment = { horizontal: 'center' };

  ws.mergeCells(`A6:C6`);
  ws.getCell('A6').value = `ថ្នាក់ ${className}`;
  ws.getCell('A6').font = { name: 'Khmer OS Siemreap', size: 10 };

  // ── ROW 7: Week group headers ──────────────────────────
  // Group days into chunks of 6 (Mon–Sat)
  const weeks: number[][] = [];
  for (let i = 0; i < schoolDays.length; i += 6) {
    weeks.push(schoolDays.slice(i, i + 6));
  }

  const weekColors = ['FF00B0F0', 'FFFF66CC', 'FF00B0F0'];
  let colOffset = 6; // col F+1 = col 6 (1-based), days start at col 6

  ws.getRow(7).height = 42; // Increased to 42 for subscript room!
  ws.getRow(8).height = 28; // Increased to 28!
  ws.getRow(9).height = 28; // Increased to 28!

  weeks.forEach((week, wi) => {
    const startCol = colOffset;
    const endCol = colOffset + week.length * 3 - 1;
    const startLetter = colLetter(startCol);
    const endLetter = colLetter(endCol);
    if (startCol < endCol) {
      ws.mergeCells(`${startLetter}7:${endLetter}7`);
    }
    const wCell = ws.getCell(`${startLetter}7`);
    const weekLabels = ['សប្ដាហ៍ទី១', 'សប្ដាហ៍ទី២', 'សប្ដាហ៍ទី៣', 'សប្ដាហ៍ទី៤', 'សប្ដាហ៍ទី៥'];
    const firstDay = week[0];
    const weekNum = Math.floor((firstDay - 1) / 6);
    wCell.value = weekLabels[weekNum] || `សប្ដាហ៍ទី${weekNum + 1}`;
    styleHeader(wCell, weekColors[weekNum % 3]);

    // Day numbers row (row 8) & វ/ច/អ row (row 9)
    week.forEach((day, di) => {
      const vCol = colOffset + di * 3;
      const cCol = vCol + 1;
      const aCol = vCol + 2;
      const vLetter = colLetter(vCol);
      const aLetter = colLetter(aCol);

      // Day number
      ws.mergeCells(`${vLetter}8:${aLetter}8`);
      const dayCell = ws.getCell(`${vLetter}8`);
      dayCell.value = day;
      styleHeader(dayCell, weekColors[weekNum % 3]);

      // វ / ច / អ sub-headers
      const vHead = ws.getCell(`${vLetter}9`);
      vHead.value = 'វ'; styleHeader(vHead, weekColors[weekNum % 3]);
      const cHead = ws.getCell(`${colLetter(cCol)}9`);
      cHead.value = 'ច'; styleHeader(cHead, weekColors[weekNum % 3]);
      const aHead = ws.getCell(`${aLetter}9`);
      aHead.value = 'អ'; styleHeader(aHead, weekColors[weekNum % 3]);
    });

    colOffset += week.length * 3;
  });

  // Fixed headers rows 7-9
  const fixedHeaders = [
    { label: 'ល.រ', rows: '7:9', col: 'A' },
    { label: 'អត្តលេខ', rows: '7:9', col: 'B' },
    { label: 'គោត្តនាម និងនាម', rows: '7:9', col: 'C' },
    { label: 'ភេទ', rows: '7:9', col: 'D' },
    { label: 'ថ្នាក់', rows: '7:9', col: 'E' },
  ];
  fixedHeaders.forEach(({ label, rows, col }) => {
    ws.mergeCells(`${col}7:${col}9`);
    const c = ws.getCell(`${col}7`);
    c.value = label;
    styleHeader(c, 'FF00B0F0');
  });

  // Summary columns headers
  const sumStartCol = colOffset;
  const numWeeks = weeks.length;
  
  // Row 7 & 8 merged for វ, ច, អ
  ws.mergeCells(`${colLetter(sumStartCol)}7:${colLetter(sumStartCol + 2)}7`);
  const sumTitle = ws.getCell(`${colLetter(sumStartCol)}7`);
  sumTitle.value = `ទាំង${numWeeks}សប្ដាហ៍`;
  styleHeader(sumTitle, 'FFFFFF00');

  ws.mergeCells(`${colLetter(sumStartCol)}8:${colLetter(sumStartCol + 2)}8`);
  const sumSubTitle = ws.getCell(`${colLetter(sumStartCol)}8`);
  sumSubTitle.value = 'សរុប';
  styleHeader(sumSubTitle, 'FFFFFF00');

  // Row 9 វ, ច, អ
  const vSumHead = ws.getCell(`${colLetter(sumStartCol)}9`);
  vSumHead.value = 'វ'; styleHeader(vSumHead, 'FFFFFF00');
  const cSumHead = ws.getCell(`${colLetter(sumStartCol + 1)}9`);
  cSumHead.value = 'ច'; styleHeader(cSumHead, 'FFFFFF00');
  const aSumHead = ws.getCell(`${colLetter(sumStartCol + 2)}9`);
  aSumHead.value = 'អ'; styleHeader(aSumHead, 'FFFFFF00');

  // សរុបអវត្តមាន
  ws.mergeCells(`${colLetter(sumStartCol + 3)}7:${colLetter(sumStartCol + 3)}9`);
  const totalAbHead = ws.getCell(`${colLetter(sumStartCol + 3)}7`);
  totalAbHead.value = 'សរុបអវត្តមាន (ម៉ោង)'; styleHeader(totalAbHead, 'FFFFFF00');

  // Others/Result (Row 7-9 merged)
  ws.mergeCells(`${colLetter(sumStartCol + 4)}7:${colLetter(sumStartCol + 4)}9`);
  const resultHead = ws.getCell(`${colLetter(sumStartCol + 4)}7`);
  resultHead.value = 'ផ្សេងៗ';
  styleHeader(resultHead, 'FFFFFF00');

  // ── Data Rows (from row 10) ────────────────────────────
  students.forEach((student, idx) => {
    const rowNum = 10 + idx;
    const row = ws.getRow(rowNum);
    row.height = 24;

    const setDataCell = (col: number, val: any, bg = 'FFFFFFFF') => {
      const c = row.getCell(col);
      c.value = val;
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      c.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
      c.alignment = { horizontal: 'center', vertical: 'middle' };
      c.font = { name: 'Khmer OS Siemreap', size: 10 };
    };

    setDataCell(1, idx + 1);
    setDataCell(2, student.studentId);
    const nameCell = row.getCell(3);
    nameCell.value = student.nameKh;
    nameCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    nameCell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
    nameCell.alignment = { horizontal: 'left', vertical: 'middle' };
    nameCell.font = { name: 'Khmer OS Siemreap', size: 10 };
    setDataCell(4, student.gender === 'Female' || student.gender === 'ស' ? 'ស' : 'ប');
    setDataCell(5, className);

    let totalPresent = 0;
    let totalExcused = 0;
    let totalUnexcused = 0;
    const studentAtt = attendance[student.id] || {};

    schoolDays.forEach((day, di) => {
      const vColIdx = 6 + di * 3;
      const cColIdx = vColIdx + 1;
      const aColIdx = vColIdx + 2;
      const dayStats = studentAtt[day] || { present: 0, excused: 0, unexcused: 0 };
      
      let valV = '';
      let valC = '';
      let valA = '';

      if (dayStats.present > 0) {
        valV = dayStats.present.toString();
        totalPresent += dayStats.present;
      }
      if (dayStats.excused > 0) {
        valC = dayStats.excused.toString();
        totalExcused += dayStats.excused;
      }
      if (dayStats.unexcused > 0) {
        valA = dayStats.unexcused.toString();
        totalUnexcused += dayStats.unexcused;
      }

      const styleCell = (cell: ExcelJS.Cell, val: string, color: string) => {
        cell.value = val;
        cell.fill = { type:'pattern', pattern:'solid', fgColor:{ argb: 'FFFFFFFF' } };
        cell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { name: 'Khmer OS Siemreap', size: 10, color: { argb: color } };
      };

      styleCell(row.getCell(vColIdx), valV, 'FF00B050'); // Green
      styleCell(row.getCell(cColIdx), valC, 'FF0000FF'); // Blue
      styleCell(row.getCell(aColIdx), valA, 'FFFF0000'); // Red
    });

    // Summary
    const styleSum = (cell: ExcelJS.Cell, val: any, color: string) => {
      cell.value = val;
      cell.font = { name: 'Khmer OS Siemreap', size: 10, color: { argb: color } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
    };

    styleSum(row.getCell(sumStartCol), totalPresent || '', 'FF00B050');
    styleSum(row.getCell(sumStartCol + 1), totalExcused || '', 'FF0000FF');
    styleSum(row.getCell(sumStartCol + 2), totalUnexcused || '', 'FFFF0000');
    
    const totalAllAb = totalExcused + totalUnexcused;
    styleSum(row.getCell(sumStartCol + 3), totalAllAb || '', 'FF990000');

    const rCell = row.getCell(sumStartCol + 4);
    rCell.value = totalAllAb >= 10 ? 'ត្រូវហៅអាណាព្យាបាល' : 'មកទៀងទាត់';
    rCell.font = { name: 'Khmer OS Siemreap', size: 10, color: { argb: totalAllAb >= 10 ? 'FFFF0000' : 'FF000000' } };
    rCell.alignment = { horizontal: 'center', vertical: 'middle' };
    rCell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
  });

  // ── Footer ────────────────────────────────────────────
  const noteRow = 10 + students.length + 2;
  ws.mergeCells(`B${noteRow}:J${noteRow}`);
  const noteCell = ws.getCell(`B${noteRow}`);
  noteCell.value = 'សម្គាល់៖ តួលេខនៅក្នុងប្រអប់ (វ, ច, អ) គឺតំណាងឱ្យចំនួនម៉ោងសិក្សា។';
  noteCell.font = { name: 'Khmer OS Siemreap', size: 10, italic: true };
  noteCell.alignment = { horizontal: 'left', vertical: 'middle' };

  const footerRow = 10 + students.length + 5;
  ws.getCell(`C${footerRow}`).value = 'បានឃើញ និងឯកភាព';
  ws.getCell(`C${footerRow}`).font = { name: 'Khmer OS Siemreap', size: 10 };
  ws.getCell(`C${footerRow + 1}`).value = 'នាយកសាលា';
  ws.getCell(`C${footerRow + 1}`).font = { name: 'Khmer OS Siemreap', size: 10 };
  ws.getCell(`${colLetter(sumStartCol - 3)}${footerRow}`).value = `ថ្ងៃទី...... ខែ${monthKh} ឆ្នាំ ២០២...`;
  ws.getCell(`${colLetter(sumStartCol - 3)}${footerRow}`).font = { name: 'Khmer OS Siemreap', size: 10 };
  ws.getCell(`${colLetter(sumStartCol - 3)}${footerRow + 1}`).value = 'គ្រូបន្ទុកថ្នាក់';
  ws.getCell(`${colLetter(sumStartCol - 3)}${footerRow + 1}`).font = { name: 'Khmer OS Siemreap', size: 10 };

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `វត្តមានប្រចាំខែ${monthKh}_${className}_${year}.xlsx`);
}

export async function exportAttendanceSummary(data: {
  className: string;
  grade: string;
  period: 'Semester 1' | 'Semester 2' | 'Annual';
  periodKh: string;
  year: string;
  students: { id: number; studentId: string; nameKh: string; nameEn: string; gender: string }[];
}) {
  const { className, grade, period, periodKh, year, students } = data;

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('សង្ខេបវត្តមាន', {
    pageSetup: {
      paperSize: 9,
      orientation: 'landscape',
      margins: { left: 0.15, right: 0.15, top: 0.2, bottom: 0.2, header: 0, footer: 0 },
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    }
  });

  const months = {
    'Semester 1': ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'],
    'Semester 2': ['ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា'],
    'Annual': ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា']
  }[period];

  const numMonths = months.length;

  // Columns A to E: fixed
  const fixedCols = [
    { width: 6 }, { width: 12 }, { width: 30 }, { width: 6 }, { width: 8 }
  ];
  // Month columns: 2 columns per month, width 5.5 each
  const monthCols = months.flatMap(() => [{ width: 5.5 }, { width: 5.5 }]);
  // Summary columns: 3 columns, widths 8, 8, 12
  const summaryCols = [{ width: 8 }, { width: 8 }, { width: 12 }];

  ws.columns = [...fixedCols, ...monthCols, ...summaryCols];
  const totalCols = 5 + numMonths * 2 + 3;

  const colLetter = (idx: number): string => {
    let s = '';
    while (idx > 0) {
      const rem = (idx - 1) % 26;
      s = String.fromCharCode(65 + rem) + s;
      idx = Math.floor((idx - 1) / 26);
    }
    return s;
  };

  const styleHeader = (cell: ExcelJS.Cell, bg = 'FF00B0F0') => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    cell.font = { name: 'Khmer OS Muol Light', size: 10, color: { argb: 'FF000000' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
  };

  // Administrative Header
  const lastCol = colLetter(totalCols);
  const rightStart = colLetter(totalCols - 4);

  ws.mergeCells(`A1:F1`);
  ws.getCell('A1').value = 'ក្រសួងអប់រំ យុវជន និងកីឡា';
  ws.getCell('A1').font = { name: 'Khmer OS Muol Light', size: 12 };

  ws.mergeCells(`${rightStart}1:${lastCol}1`);
  ws.getCell(`${rightStart}1`).value = 'ព្រះរាជាណាចក្រកម្ពុជា';
  ws.getCell(`${rightStart}1`).font = { name: 'Khmer OS Muol Light', size: 12 };
  ws.getCell(`${rightStart}1`).alignment = { horizontal: 'center' };

  ws.mergeCells(`A2:F2`);
  ws.getCell('A2').value = 'មន្ទីរអប់រំ យុវជន និងកីឡា';
  ws.getCell('A2').font = { name: 'Khmer OS Muol Light', size: 12 };

  ws.mergeCells(`${rightStart}2:${lastCol}2`);
  ws.getCell(`${rightStart}2`).value = 'ជាតិ សាសនា ព្រះមហាក្សត្រ';
  ws.getCell(`${rightStart}2`).font = { name: 'Khmer OS Muol Light', size: 12 };
  ws.getCell(`${rightStart}2`).alignment = { horizontal: 'center' };

  ws.mergeCells(`A3:F3`);
  ws.getCell('A3').value = 'វិទ្យាល័យ ផ្លូវមាស';
  ws.getCell('A3').font = { name: 'Khmer OS Muol Light', size: 12 };

  ws.mergeCells(`${rightStart}3:${lastCol}3`);
  ws.getCell(`${rightStart}3`).value = '3';
  ws.getCell(`${rightStart}3`).font = { name: 'Tacteing', size: 28 };
  ws.getCell(`${rightStart}3`).alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(3).height = 24;

  // Title
  ws.mergeCells(`A4:${lastCol}4`);
  const titleCell = ws.getCell(`A4`);
  titleCell.value = `សន្លឹកសង្ខេបអវត្តមានសិស្ស${periodKh}`;
  titleCell.font = { name: 'Khmer OS Muol Light', size: 12, color: { argb: 'FFFF0000' } };
  titleCell.alignment = { horizontal: 'center' };

  // Subtitle
  ws.mergeCells(`A5:${lastCol}5`);
  const subTitle = ws.getCell(`A5`);
  subTitle.value = `ឆ្នាំសិក្សា ${year}  |  ថ្នាក់ ${className}`;
  subTitle.font = { name: 'Khmer OS Siemreap', size: 10 };
  subTitle.alignment = { horizontal: 'center' };

  ws.getRow(7).height = 28;
  ws.getRow(8).height = 24;
  ws.getRow(9).height = 24;

  // Fixed Headers (Rows 7-9 Merged)
  const fixedHeaders = [
    { label: 'ល.រ', col: 'A' },
    { label: 'អត្តលេខ', col: 'B' },
    { label: 'គោត្តនាម និងនាម', col: 'C' },
    { label: 'ភេទ', col: 'D' },
    { label: 'ថ្នាក់', col: 'E' },
  ];
  fixedHeaders.forEach(({ label, col }) => {
    ws.mergeCells(`${col}7:${col}9`);
    const c = ws.getCell(`${col}7`);
    c.value = label;
    styleHeader(c, 'FF00B0F0');
  });

  // Month Headers (Rows 7-9)
  let colOffset = 6;
  const monthColors = ['FF00B0F0', 'FFFF66CC', 'FF00B0F0'];
  months.forEach((m, idx) => {
    const startLetter = colLetter(colOffset);
    const endLetter = colLetter(colOffset + 1);

    // Row 7: Month name
    ws.mergeCells(`${startLetter}7:${endLetter}7`);
    const mCell = ws.getCell(`${startLetter}7`);
    mCell.value = m;
    styleHeader(mCell, monthColors[idx % 3]);

    // Row 8-9: Day type sub-headers (ច/ឥត)
    ws.mergeCells(`${startLetter}8:${startLetter}9`);
    const cCell = ws.getCell(`${startLetter}8`);
    cCell.value = 'ច';
    styleHeader(cCell, monthColors[idx % 3]);

    ws.mergeCells(`${endLetter}8:${endLetter}9`);
    const ucCell = ws.getCell(`${endLetter}8`);
    ucCell.value = 'ឥត';
    styleHeader(ucCell, monthColors[idx % 3]);

    colOffset += 2;
  });

  // Summary Headers
  const sumStartCol = colOffset;
  ws.mergeCells(`${colLetter(sumStartCol)}7:${colLetter(sumStartCol + 2)}7`);
  const sumTitle = ws.getCell(`${colLetter(sumStartCol)}7`);
  sumTitle.value = 'សរុបអវត្តមាន';
  styleHeader(sumTitle, 'FFFFFF00');

  // Row 8 & 9 sub-headers for summary
  ws.mergeCells(`${colLetter(sumStartCol)}8:${colLetter(sumStartCol)}9`);
  const sumCCell = ws.getCell(`${colLetter(sumStartCol)}8`);
  sumCCell.value = 'ច្បាប់';
  styleHeader(sumCCell, 'FFFFFF00');

  ws.mergeCells(`${colLetter(sumStartCol + 1)}8:${colLetter(sumStartCol + 1)}9`);
  const sumUCCell = ws.getCell(`${colLetter(sumStartCol + 1)}8`);
  sumUCCell.value = 'ឥតច្បាប់';
  styleHeader(sumUCCell, 'FFFFFF00');

  ws.mergeCells(`${colLetter(sumStartCol + 2)}8:${colLetter(sumStartCol + 2)}9`);
  const sumTotalCell = ws.getCell(`${colLetter(sumStartCol + 2)}8`);
  sumTotalCell.value = 'សរុបរួម';
  styleHeader(sumTotalCell, 'FFFFFF00');

  // Data Rows
  students.forEach((student, idx) => {
    const rowNum = 10 + idx;
    const row = ws.getRow(rowNum);
    row.height = 24;

    const thinBorder: Partial<ExcelJS.Borders> = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };

    const setDataCell = (col: number, val: any, align = 'center') => {
      const c = row.getCell(col);
      c.value = val;
      c.border = thinBorder;
      c.alignment = { horizontal: align as any, vertical: 'middle' };
      c.font = { name: 'Khmer OS Siemreap', size: 10 };
    };

    setDataCell(1, idx + 1);
    setDataCell(2, student.studentId);
    setDataCell(3, student.nameKh, 'left');
    setDataCell(4, student.gender === 'Female' || student.gender === 'ស' ? 'ស' : 'ប');
    setDataCell(5, className);

    // Empty cells for the months
    for (let c = 6; c < sumStartCol; c++) {
      setDataCell(c, '');
    }

    // Formulas for summary
    const excusedCols: string[] = [];
    const unexcusedCols: string[] = [];
    for (let mIdx = 0; mIdx < numMonths; mIdx++) {
      excusedCols.push(`${colLetter(6 + mIdx * 2)}${rowNum}`);
      unexcusedCols.push(`${colLetter(6 + mIdx * 2 + 1)}${rowNum}`);
    }

    const excuseColLetter = colLetter(sumStartCol);
    const unexcuseColLetter = colLetter(sumStartCol + 1);

    row.getCell(sumStartCol).value = { formula: `SUM(${excusedCols.join(',')})` };
    row.getCell(sumStartCol).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(sumStartCol).font = { name: 'Khmer OS Siemreap', size: 10, bold: true };
    row.getCell(sumStartCol).border = thinBorder;

    row.getCell(sumStartCol + 1).value = { formula: `SUM(${unexcusedCols.join(',')})` };
    row.getCell(sumStartCol + 1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(sumStartCol + 1).font = { name: 'Khmer OS Siemreap', size: 10, bold: true };
    row.getCell(sumStartCol + 1).border = thinBorder;

    row.getCell(sumStartCol + 2).value = { formula: `${excuseColLetter}${rowNum}+${unexcuseColLetter}${rowNum}` };
    row.getCell(sumStartCol + 2).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(sumStartCol + 2).font = { name: 'Khmer OS Siemreap', size: 10, bold: true };
    row.getCell(sumStartCol + 2).border = thinBorder;
  });

  // Footer
  const footerRow = 10 + students.length + 3;
  ws.getCell(`C${footerRow}`).value = 'បានឃើញ និងឯកភាព';
  ws.getCell(`C${footerRow}`).font = { name: 'Khmer OS Siemreap', size: 10, bold: true };
  ws.getCell(`C${footerRow + 1}`).value = 'នាយកសាលា';
  ws.getCell(`C${footerRow + 1}`).font = { name: 'Khmer OS Siemreap', size: 10, bold: true };

  ws.getCell(`${colLetter(sumStartCol - 4)}${footerRow}`).value = `ថ្ងៃទី...... ខែ...... ឆ្នាំ ២០២...`;
  ws.getCell(`${colLetter(sumStartCol - 4)}${footerRow}`).font = { name: 'Khmer OS Siemreap', size: 10, italic: true };
  ws.getCell(`${colLetter(sumStartCol - 4)}${footerRow + 1}`).value = 'គ្រូបន្ទុកថ្នាក់';
  ws.getCell(`${colLetter(sumStartCol - 4)}${footerRow + 1}`).font = { name: 'Khmer OS Siemreap', size: 10, bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `សង្ខេបវត្តមាន${periodKh}_${className}_${year}.xlsx`);
}
