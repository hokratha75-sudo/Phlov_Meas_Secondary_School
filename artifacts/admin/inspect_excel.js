import ExcelJS from 'exceljs';
import path from 'path';

const filePath = 'c:/laragon/www/Phlov_Meas_Secondary_School/excel_docs/ថ្មី_10A_នន់_សុវណ្ណរាជ_កម្មវិធីបូកពិន្ទុសិស្ស_2025_2026.xlsm';

async function inspect() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  // Look at "មករា" (January) sheet specifically
  const ws = workbook.getWorksheet('មករា');
  if (ws) {
    console.log(`\n--- Inspecting Sheet: ${ws.name} ---`);
    
    // Rows 5 and 6 usually contain subject names and max scores
    for (let i = 4; i <= 6; i++) {
      const row = ws.getRow(i);
      const values = row.values.slice(1);
      console.log(`Row ${i}:`, values.join(' | '));
    }
  } else {
      console.log('Sheet "មករា" not found. Available sheets:', workbook.worksheets.map(w => w.name));
  }
}

inspect().catch(err => {
  console.error('Error:', err);
});
