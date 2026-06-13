import ExcelJS from "exceljs";
import path from "path";

const excelPath = "excel_docs/ថ្មី_10A_នន់_សុវណ្ណរាជ_កម្មវិធីបូកពិន្ទុសិស្ស_2025_2026.xlsm";

async function inspect() {
  try {
    const workbook = new ExcelJS.Workbook();
    console.log("Loading offline spreadsheet (takes a few seconds)...");
    await workbook.xlsx.readFile(excelPath);
    console.log("Spreadsheet loaded successfully.");

    // Let's check some likely sheets: "កំណត់" or "ព័ត៌មានសាលា" or "បញ្ចីស្រង់ពិន្ទុ"
    // Let's list sheets
    const sheets = workbook.worksheets.map(w => w.name);
    console.log("Sheets count:", sheets.length);

    // Let's inspect the "កំណត់" sheet (Config sheet) if it exists
    const configSheet = workbook.getWorksheet("កំណត់");
    if (configSheet) {
      console.log("\n--- 'កំណត់' (Config) Sheet Cell Samples ---");
      for (let r = 1; r <= 30; r++) {
        const rowVal = [];
        for (let c = 1; c <= 15; c++) {
          rowVal.push(configSheet.getCell(r, c).value);
        }
        if (rowVal.some(v => v !== null)) {
          console.log(`Row ${r}:`, rowVal.map(v => v !== null && typeof v === 'object' ? JSON.stringify(v) : v));
        }
      }
    }

    // Let's inspect the "បញ្ចីស្រង់ពិន្ទុ" sheet (Gradebook) to see subject headers and coefficients
    const gradebookSheet = workbook.getWorksheet("បញ្ចីស្រង់ពិន្ទុ");
    if (gradebookSheet) {
      console.log("\n--- 'បញ្ចីស្រង់ពិន្ទុ' (Grade Book) Sheet Headers ---");
      // Read rows 1 to 15
      for (let r = 1; r <= 15; r++) {
        const rowVal = [];
        for (let c = 1; c <= 25; c++) {
          rowVal.push(gradebookSheet.getCell(r, c).value);
        }
        if (rowVal.some(v => v !== null)) {
          console.log(`Row ${r}:`, rowVal.map(v => v !== null && typeof v === 'object' ? JSON.stringify(v) : v));
        }
      }
    }
  } catch (err) {
    console.error("Error inspecting:", err);
  }
}

inspect();
