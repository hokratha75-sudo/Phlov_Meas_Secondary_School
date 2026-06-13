const ExcelJS = require("exceljs");
const path = require("path");

async function run() {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Test", {
      pageSetup: {
        paperSize: 9,
        orientation: "portrait",
        margins: { left: 0.6, right: 0.6, top: 0.6, bottom: 0.6, header: 0, footer: 0 },
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 1
      }
    });

    worksheet.columns = [
      { key: "col1", width: 11 },
    ];
    
    worksheet.views = [{ showGridLines: false }];
    
    // Write
    const tempFile = path.resolve(__dirname, "test.xlsx");
    await workbook.xlsx.writeFile(tempFile);
    console.log("Success: ", tempFile);
  } catch (e) {
    console.error("Error: ", e);
  }
}

run();
