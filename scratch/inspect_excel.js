import ExcelJS from 'exceljs';
import path from 'path';

const filePath = 'c:/laragon/www/Phlov_Meas_Secondary_School/excel_docs/ថ្មី_10A_នន់_សុវណ្ណរាជ_កម្មវិធីបូកពិន្ទុសិស្ស_2025_2026.xlsm';

async function inspect() {
  const workbook = new ExcelJS.Workbook();
  console.log('Loading workbook...');
  await workbook.xlsx.readFile(filePath);
  
  console.log('Sheets found:', workbook.worksheets.map(ws => ws.name));
  
  for (const ws of workbook.worksheets) {
    console.log(`\n--- Inspecting Sheet: ${ws.name} ---`);
    const rowCount = ws.rowCount;
    const colCount = ws.actualColumnCount;
    console.log(`Rows: ${rowCount}, Columns: ${colCount}`);
    
    // Read first 10 rows to see headers and data structure
    for (let i = 1; i <= Math.min(10, rowCount); i++) {
      const row = ws.getRow(i);
      const values = row.values.slice(1); // ExcelJS rows are 1-indexed
      console.log(`Row ${i}:`, values.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join(' | '));
    }
  }
}

inspect().catch(err => {
  console.error('Error reading excel:', err);
});
