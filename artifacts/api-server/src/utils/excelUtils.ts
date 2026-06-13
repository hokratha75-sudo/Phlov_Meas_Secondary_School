import ExcelJS from 'exceljs';

export interface ParsedData {
    className: string;
    dayKh: string;
    timeSlot: string;
    subjectName: string;
    teacherName: string;
    roomCode: string;
    rowNumber: number;
}

export interface ValidationResult {
    isValid: boolean;
    errors: { row: number, error: string, message?: string }[];
    validData: ParsedData[];
}

const KHMER_HEADERS = ['ថ្នាក់', 'ថ្ងៃ', 'ម៉ោង', 'មុខវិជ្ជា', 'គ្រូ', 'បន្ទប់'];
const TIME_SLOTS = ['8:00 - 9:00', '9:00 - 10:00', '10:00 - 11:00', '2:00 - 3:00', '3:00 - 4:00', '4:00 - 5:00'];
const DAYS_KH = ['ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];

export function generateMasterScheduleExcel(data: any[]): ExcelJS.Workbook {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Master Schedule');

    worksheet.columns = [
        { header: KHMER_HEADERS[0], key: 'class', width: 15 },
        { header: KHMER_HEADERS[1], key: 'day', width: 15 },
        { header: KHMER_HEADERS[2], key: 'time', width: 15 },
        { header: KHMER_HEADERS[3], key: 'subject', width: 20 },
        { header: KHMER_HEADERS[4], key: 'teacher', width: 20 },
        { header: KHMER_HEADERS[5], key: 'room', width: 15 }
    ];

    for (const row of data) {
        worksheet.addRow({
            class: row.class_name,
            day: row.day_name_kh,
            time: row.time_slot || `${row.start_time} - ${row.end_time}`,
            subject: row.subject_name,
            teacher: row.teacher_name,
            room: row.room_code
        });
    }

    worksheet.getRow(1).font = { bold: true };
    return workbook;
}

export function generateTemplateExcel(): ExcelJS.Workbook {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Import Template');

    // Add headers
    worksheet.addRow(KHMER_HEADERS);
    worksheet.getRow(1).font = { bold: true };

    // Set column widths
    worksheet.getColumn(1).width = 15;
    worksheet.getColumn(2).width = 15;
    const timeCol = worksheet.getColumn(3);
    timeCol.width = 15;
    timeCol.numFmt = '@'; // Force text format to prevent 8-9 becoming a Date
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(6).width = 15;

    // Add data validation for days and time slots
    for (let i = 2; i <= 1000; i++) {
        // Day dropdown
        worksheet.getCell(`B${i}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`"${DAYS_KH.join(',')}"`]
        };
        // Time slot dropdown
        worksheet.getCell(`C${i}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`"${TIME_SLOTS.join(',')}"`]
        };
    }

    return workbook;
}

export async function parseImportedExcel(buffer: Buffer): Promise<ParsedData[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const worksheet = workbook.getWorksheet(1);
    
    if (!worksheet) {
        throw new Error("Invalid Excel format");
    }

    const parsedData: ParsedData[] = [];
    const headers = worksheet.getRow(1).values as string[];
    
    // Find column indices
    const headerMap: Record<string, number> = {};
    for (let i = 1; i < headers.length; i++) {
        if (headers[i]) {
            headerMap[headers[i].toString().trim()] = i;
        }
    }

    // Process rows starting from row 2
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        
        // Skip empty rows (must have class name)
        const classCell = row.getCell(headerMap[KHMER_HEADERS[0]] || 1).value;
        if (!classCell) continue;

        const rawTime = row.getCell(headerMap[KHMER_HEADERS[2]] || 3).value;
        let timeSlot = '';
        if (rawTime instanceof Date) {
            const m = rawTime.getMonth() + 1;
            const d = rawTime.getDate();
            const md = `${m}-${d}`;
            const dm = `${d}-${m}`;
            if (TIME_SLOTS.includes(md)) timeSlot = md;
            else if (TIME_SLOTS.includes(dm)) timeSlot = dm;
            else timeSlot = md;
        } else if (typeof rawTime === 'object' && rawTime !== null && 'result' in (rawTime as any)) {
            timeSlot = ((rawTime as any).result || '').toString().trim();
        } else {
            timeSlot = (rawTime || '').toString().trim();
        }

        parsedData.push({
            className: classCell.toString().trim(),
            dayKh: (row.getCell(headerMap[KHMER_HEADERS[1]] || 2).value || '').toString().trim(),
            timeSlot,
            subjectName: (row.getCell(headerMap[KHMER_HEADERS[3]] || 4).value || '').toString().trim(),
            teacherName: (row.getCell(headerMap[KHMER_HEADERS[4]] || 5).value || '').toString().trim(),
            roomCode: (row.getCell(headerMap[KHMER_HEADERS[5]] || 6).value || '').toString().trim(),
            rowNumber
        });
    }

    return parsedData;
}

export function validateImportData(data: ParsedData[]): ValidationResult {
    const errors: { row: number, error: string, message?: string }[] = [];
    const validData: ParsedData[] = [];

    for (const row of data) {
        let hasError = false;

        if (!row.className) {
            errors.push({ row: row.rowNumber, error: "Missing Class Name (ថ្នាក់)" });
            hasError = true;
        }
        if (!row.dayKh || !DAYS_KH.includes(row.dayKh)) {
            errors.push({ row: row.rowNumber, error: `Invalid or missing Day (ថ្ងៃ). Must be one of: ${DAYS_KH.join(', ')}` });
            hasError = true;
        }
        if (!row.timeSlot || !TIME_SLOTS.includes(row.timeSlot)) {
            errors.push({ row: row.rowNumber, error: `Invalid or missing Time Slot (ម៉ោង). Must be one of: ${TIME_SLOTS.join(', ')}` });
            hasError = true;
        }
        if (!row.subjectName) {
            errors.push({ row: row.rowNumber, error: "Missing Subject (មុខវិជ្ជា)" });
            hasError = true;
        }
        if (!row.teacherName) {
            errors.push({ row: row.rowNumber, error: "Missing Teacher (គ្រូ)" });
            hasError = true;
        }
        if (!row.roomCode) {
            errors.push({ row: row.rowNumber, error: "Missing Room (បន្ទប់)" });
            hasError = true;
        }

        if (!hasError) {
            validData.push(row);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        validData
    };
}
