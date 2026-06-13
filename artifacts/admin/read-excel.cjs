const fs = require('fs');
const ExcelJS = require('exceljs');

async function doIt() {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('c:\\laragon\\www\\Phlov_Meas_Secondary_School\\excel_docs\\ថ្មី_10A_នន់_សុវណ្ណរាជ_កម្មវិធីបូកពិន្ទុសិស្ស_2025_2026.xlsm');
    
    let out = "";
    for (const sheet of workbook.worksheets) {
      out += `\n--- Sheet: ${sheet.name} ---\n`;
      if (sheet.name.includes('បញ្ជី') || sheet.name.includes('ខែ') || sheet.name.includes('Sheet1') || true) {
        for (let i = 1; i <= 20; i++) {
          const row = sheet.getRow(i);
          out += `Row ${i}: ${JSON.stringify(row.values)}\n`;
        }
        break;
      }
    }
    fs.writeFileSync('c:\\laragon\\www\\Phlov_Meas_Secondary_School\\scratch\\output.txt', out);
    console.log("WROTE EXCEL OUTPUT TO SCRATCH!");
  } catch (err) {
    fs.writeFileSync('c:\\laragon\\www\\Phlov_Meas_Secondary_School\\scratch\\output.txt', "ERROR: " + err.message);
  }
}

doIt();
