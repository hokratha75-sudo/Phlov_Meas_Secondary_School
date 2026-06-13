import ExcelJS from 'exceljs';

async function readExcel() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('c:\\laragon\\www\\Phlov_Meas_Secondary_School\\excel_docs\\ថ្មី_10A_នន់_សុវណ្ណរាជ_កម្មវិធីបូកពិន្ទុសិស្ស_2025_2026.xlsm');
  
  for (const sheet of workbook.worksheets) {
    console.log(`Sheet: ${sheet.name}`);
    if (sheet.name.includes('បញ្ជី') || sheet.name.includes('ខែ') || sheet.name.includes('Sheet1')) {
      for (let i = 1; i <= 15; i++) {
        const row = sheet.getRow(i);
        console.log(`Row ${i}:`, row.values.slice(1, 20)); // print first 20 cells
      }
      break;
    }
  }
}

readExcel().catch(console.error);
