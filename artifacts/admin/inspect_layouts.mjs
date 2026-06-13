import ExcelJS from "exceljs";

const excelPath = "../../excel_docs/ថ្មី_10A_នន់_សុវណ្ណរាជ_កម្មវិធីបូកពិន្ទុសិស្ស_2025_2026.xlsm";

async function inspectLayouts() {
  try {
    const workbook = new ExcelJS.Workbook();
    console.log("Loading workbook...");
    await workbook.xlsx.readFile(excelPath);
    console.log("Loaded.");

    // 1. Inspect "បញ្ចីស្រង់ពិន្ទុ" (Grade Recording Sheet)
    const gradebookSheet = workbook.getWorksheet("បញ្ចីស្រង់ពិន្ទុ");
    if (gradebookSheet) {
      console.log("\n==================================================");
      console.log("LAYOUT FOR 'បញ្ចីស្រង់ពិន្ទុ' (Grade recording sheet)");
      console.log("==================================================");
      // Print rows 5 to 10
      for (let r = 5; r <= 10; r++) {
        const rowVal = [];
        for (let c = 1; c <= 30; c++) {
          rowVal.push(gradebookSheet.getCell(r, c).value);
        }
        console.log(`Row ${r}:`, rowVal.map(v => v !== null && typeof v === 'object' ? JSON.stringify(v) : v));
      }
    }

    // 2. Inspect "លទ្ធផលខែA" (Monthly Ranking Results Sheet)
    const rankingSheet = workbook.getWorksheet("លទ្ធផលខែA");
    if (rankingSheet) {
      console.log("\n==================================================");
      console.log("LAYOUT FOR 'លទ្ធផលខែA' (Monthly Results / Ranking Sheet)");
      console.log("==================================================");
      // Print rows 1 to 10
      for (let r = 1; r <= 10; r++) {
        const rowVal = [];
        for (let c = 1; c <= 20; c++) {
          rowVal.push(rankingSheet.getCell(r, c).value);
        }
        console.log(`Row ${r}:`, rowVal.map(v => v !== null && typeof v === 'object' ? JSON.stringify(v) : v));
      }
    }

  } catch (err) {
    console.error("Error inspecting:", err);
  }
}

inspectLayouts();
