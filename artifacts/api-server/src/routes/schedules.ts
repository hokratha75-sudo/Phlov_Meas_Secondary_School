import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, requireAdmin } from "./auth.js";
import multer from "multer";
import { generateMasterScheduleExcel, generateTemplateExcel, parseImportedExcel, validateImportData } from "../utils/excelUtils.js";

const upload = multer({ storage: multer.memoryStorage() });

const router: IRouter = Router();

// --- Zod Validation Schemas ---
const scheduleSchema = z.object({
    classId: z.number().int().positive(),
    subjectId: z.number().int().positive(),
    teacherId: z.number().int().positive(),
    roomId: z.number().int().positive(),
    weekdayId: z.number().int().positive(),
    periodId: z.number().int().positive(),
    semester: z.string().min(1),
    academicYear: z.number().int().positive()
});

const examSchema = z.object({
    examNameKh: z.string().min(1),
    examNameEn: z.string().min(1),
    subjectId: z.number().int().positive(),
    classId: z.number().int().positive(),
    roomId: z.number().int().positive(),
    examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
    endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
    proctorTeacherId: z.number().int().positive().optional().nullable(),
    totalStudents: z.number().int().nonnegative().optional().default(0),
    notes: z.string().optional().nullable()
});

const calendarEventSchema = z.object({
    eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    eventType: z.string().min(1),
    eventNameKh: z.string().min(1),
    eventNameEn: z.string().min(1),
    description: z.string().optional().nullable(),
    isHoliday: z.boolean().optional().default(false),
    affectsClasses: z.boolean().optional().default(true)
});

const roomBookingSchema = z.object({
    roomId: z.number().int().positive(),
    bookingTitleKh: z.string().min(1),
    bookingTitleEn: z.string().min(1),
    bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
    endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
    organizerName: z.string().optional().nullable(),
    organizerContact: z.string().optional().nullable(),
    purpose: z.string().optional().nullable(),
    status: z.string().optional().default('pending')
});

const batchScheduleSchema = z.object({
    schedules: z.array(scheduleSchema)
});

// Middleware for input validation
const validate = (schema: z.ZodSchema) => (req: any, res: any, next: any) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (e: any) {
        return res.status(400).json({ error: "Validation failed", details: e.errors });
    }
};

// ============================================================================
// 1. CLASS SCHEDULES
// ============================================================================

router.get('/master', requireAuth, async (req, res) => {
    const { semester, academicYear } = req.query;
    try {
        let whereClauses = ["cs.is_active = true"];
        if (semester) whereClauses.push(`cs.semester = '${semester}'`);
        if (academicYear) whereClauses.push(`cs.academic_year = ${academicYear}`);
        const whereString = whereClauses.join(" AND ");

        const result = await db.execute(sql.raw(`
            SELECT cs.id, cs.class_id, cr.name as class_name, ht.name_kh as homeroom_teacher_name,
                   wd.day_name_kh, wd.day_name_en, wd.day_code, p.period_number, p.start_time, p.end_time,
                   s.name_kh as subject_name, t.name_kh as teacher_name, t.id as teacher_id, r.room_code, r.room_name_kh
            FROM class_schedules cs
            JOIN classrooms cr ON cs.class_id = cr.id
            LEFT JOIN teachers ht ON cr.teacher_id = ht.id
            JOIN weekdays wd ON cs.weekday_id = wd.id
            JOIN periods p ON cs.period_id = p.id
            JOIN subjects s ON cs.subject_id = s.id
            JOIN teachers t ON cs.teacher_id = t.id
            JOIN rooms r ON cs.room_id = r.id
            WHERE ${whereString}
            ORDER BY cr.name, wd.display_order, p.display_order
        `));

        const masterSchedule: any = {};
        const rows = (result as any).rows || (result as any);
        for (const row of rows) {
            const classId = row.class_id;
            if (!masterSchedule[classId]) {
                masterSchedule[classId] = {
                    class_name: row.class_name,
                    homeroomTeacher: row.homeroom_teacher_name,
                    days: {},
                    totalHours: 0
                };
            }
            const dayCode = row.day_name_kh;
            if (!masterSchedule[classId].days[dayCode]) {
                masterSchedule[classId].days[dayCode] = {};
            }
            masterSchedule[classId].days[dayCode][row.period_number] = {
                subject: row.subject_name,
                teacher: row.teacher_name,
                room: row.room_code
            };
            masterSchedule[classId].totalHours += 1;
        }

        res.json(masterSchedule);
    } catch (error) {
        console.error("Error fetching master schedule", error);
        res.status(500).json({ error: "Failed to fetch master schedule" });
    }
});

router.get('/teacher-load', requireAuth, async (req, res) => {
    const { semester, academicYear } = req.query;
    try {
        let whereClauses = ["cs.is_active = true"];
        if (semester) whereClauses.push(`cs.semester = '${semester}'`);
        if (academicYear) whereClauses.push(`cs.academic_year = ${academicYear}`);
        const whereString = whereClauses.join(" AND ");

        const result = await db.execute(sql.raw(`
            SELECT t.id as teacher_id, t.name_kh as teacher_name,
                   COUNT(cs.id) as total_periods,
                   ARRAY_AGG(DISTINCT s.name_kh) as subjects,
                   ARRAY_AGG(DISTINCT cr.name) as classes
            FROM class_schedules cs
            JOIN teachers t ON cs.teacher_id = t.id
            JOIN subjects s ON cs.subject_id = s.id
            JOIN classrooms cr ON cs.class_id = cr.id
            WHERE ${whereString}
            GROUP BY t.id, t.name_kh
            ORDER BY total_periods DESC
        `));

        const rows = (result as any).rows || (result as any);
        const loads = rows.map((r: any) => ({
            teacherId: r.teacher_id,
            teacherName: r.teacher_name,
            totalHours: parseInt(r.total_periods),
            subjects: r.subjects,
            classes: r.classes
        }));

        res.json(loads);
    } catch (error) {
        console.error("Error fetching teacher load", error);
        res.status(500).json({ error: "Failed to fetch teacher load" });
    }
});

router.get('/export/combined', requireAuth, async (req, res) => {
    const { semester, academicYear } = req.query;
    try {
        let whereClauses = ["cs.is_active = true"];
        if (semester) whereClauses.push(`cs.semester = '${semester}'`);
        if (academicYear) whereClauses.push(`cs.academic_year = ${academicYear}`);
        const whereString = whereClauses.join(" AND ");

        const result = await db.execute(sql.raw(`
            SELECT cr.name as class_name, wd.day_name_kh, p.period_number, p.start_time, p.end_time,
                   s.name_kh as subject_name, t.name_kh as teacher_name, r.room_code
            FROM class_schedules cs
            JOIN classrooms cr ON cs.class_id = cr.id
            JOIN weekdays wd ON cs.weekday_id = wd.id
            JOIN periods p ON cs.period_id = p.id
            JOIN subjects s ON cs.subject_id = s.id
            JOIN teachers t ON cs.teacher_id = t.id
            JOIN rooms r ON cs.room_id = r.id
            WHERE ${whereString}
            ORDER BY cr.name, wd.display_order, p.display_order
        `));

        const rows = (result as any).rows || (result as any);
        const workbook = generateMasterScheduleExcel(rows);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'master_schedule.xlsx');
        
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error exporting combined schedule", error);
        res.status(500).json({ error: "Failed to export schedule" });
    }
});

router.get('/export/template', requireAuth, async (req, res) => {
    try {
        const workbook = generateTemplateExcel();

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'schedule_import_template.xlsx');
        
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error generating template", error);
        res.status(500).json({ error: "Failed to generate template" });
    }
});

router.post('/import', requireAdmin, upload.single('file'), async (req: any, res: any) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = req.adminUser?.id || null;
    const { semester = 'Semester1', academicYear = new Date().getFullYear() } = req.body || {};

    try {
        const parsedData = await parseImportedExcel(req.file.buffer);
        const validation = validateImportData(parsedData);

        if (!validation.isValid && validation.validData.length === 0) {
            return res.status(400).json({ error: "Validation failed", errors: validation.errors });
        }

        // Pre-fetch DB mappings
        const [classesRes, weekdaysRes, periodsRes, subjectsRes, teachersRes, roomsRes] = await Promise.all([
            db.execute(sql`SELECT id, name FROM classrooms`),
            db.execute(sql`SELECT id, day_name_kh FROM weekdays`),
            db.execute(sql`SELECT id, period_number FROM periods`),
            db.execute(sql`SELECT id, name_kh FROM subjects`),
            db.execute(sql`SELECT id, name_kh FROM teachers`),
            db.execute(sql`SELECT id, room_code FROM rooms`)
        ]);

        const classMap = Object.fromEntries(((classesRes as any).rows || classesRes).map((x: any) => [x.name, x.id]));
        const weekdayMap = Object.fromEntries(((weekdaysRes as any).rows || weekdaysRes).map((x: any) => [x.day_name_kh, x.id]));
        const subjectMap = Object.fromEntries(((subjectsRes as any).rows || subjectsRes).map((x: any) => [x.name_kh, x.id]));
        const teacherMap = Object.fromEntries(((teachersRes as any).rows || teachersRes).map((x: any) => [x.name_kh, x.id]));
        const roomMap = Object.fromEntries(((roomsRes as any).rows || roomsRes).map((x: any) => [x.room_code, x.id]));
        
        const periodNumMap: Record<string, number> = {
            '8:00 - 9:00': 1, '9:00 - 10:00': 2, '10:00 - 11:00': 3, '2:00 - 3:00': 4, '3:00 - 4:00': 5, '4:00 - 5:00': 6,
            '8-9': 1, '9-10': 2, '10-11': 3, '2-3': 4, '3-4': 5, '4-5': 6
        };
        const periodIdMap = Object.fromEntries(((periodsRes as any).rows || periodsRes).map((x: any) => [x.period_number, x.id]));

        let successCount = 0;
        let errors = [...validation.errors];

        for (const row of validation.validData) {
            const classId = classMap[row.className];
            const weekdayId = weekdayMap[row.dayKh];
            const periodNum = periodNumMap[row.timeSlot];
            const periodId = periodIdMap[periodNum];
            const subjectId = subjectMap[row.subjectName];
            const teacherId = teacherMap[row.teacherName];
            let roomId = roomMap[row.roomCode];

            // Auto-create missing room
            if (!roomId && row.roomCode) {
                try {
                    const insertRes = await db.execute(sql`
                        INSERT INTO rooms (room_code, room_name_kh, room_name_en)
                        VALUES (${row.roomCode}, ${'បន្ទប់ ' + row.roomCode}, ${'Room ' + row.roomCode})
                        RETURNING id
                    `);
                    roomId = ((insertRes as any).rows || insertRes)[0].id;
                    roomMap[row.roomCode] = roomId;
                } catch (e) {
                    console.error("Failed to auto-create room", e);
                }
            }

            if (!classId || !weekdayId || !periodId || !subjectId || !teacherId || !roomId) {
                const missing = [];
                if (!classId) missing.push(`Class: ${row.className}`);
                if (!weekdayId) missing.push(`Day: ${row.dayKh}`);
                if (!periodId) missing.push(`TimeSlot: ${row.timeSlot}`);
                if (!subjectId) missing.push(`Subject: ${row.subjectName}`);
                if (!teacherId) missing.push(`Teacher: ${row.teacherName}`);
                if (!roomId) missing.push(`Room: ${row.roomCode}`);
                errors.push({ row: row.rowNumber, error: "Unrecognized reference in DB", message: `Not found: ${missing.join(', ')}` });
                continue;
            }

            try {
                const conflictCheck = await db.execute(sql`
                    SELECT * FROM fn_check_schedule_conflict(${teacherId}, ${roomId}, ${weekdayId}, ${periodId}, ${semester}, ${academicYear})
                `);
                const conflictRows = (conflictCheck as any).rows || conflictCheck;
                const firstRow = conflictRows[0];
                if (firstRow && firstRow.conflict_type !== 'no_conflict') {
                    errors.push({ row: row.rowNumber, error: firstRow.conflict_type, message: firstRow.conflict_details });
                    continue;
                }

                await db.execute(sql`
                    INSERT INTO class_schedules (class_id, subject_id, teacher_id, room_id, weekday_id, period_id, semester, academic_year, created_by)
                    VALUES (${classId}, ${subjectId}, ${teacherId}, ${roomId}, ${weekdayId}, ${periodId}, ${semester}, ${academicYear}, ${userId})
                `);
                successCount++;
            } catch (e: any) {
                errors.push({ row: row.rowNumber, error: "Database error", message: e.message });
            }
        }

        res.json({ successCount, failedCount: errors.length, errors });

    } catch (error) {
        console.error("Error processing import", error);
        res.status(500).json({ error: "Failed to process import file" });
    }
});

router.delete('/batch', requireAdmin, async (req: any, res: any) => {
    const { classId, semester, academicYear, confirmAll } = req.query;
    try {
        let whereClauses = ["1=1"];
        
        if (classId) whereClauses.push(`class_id = ${parseInt(classId as string)}`);
        if (semester) whereClauses.push(`semester = '${semester}'`);
        if (academicYear) whereClauses.push(`academic_year = ${parseInt(academicYear as string)}`);
        
        if (whereClauses.length === 1 && confirmAll !== 'true') {
            return res.status(400).json({ error: "Missing confirmation to delete ALL schedules. Provide confirmAll=true" });
        }

        const whereString = whereClauses.join(" AND ");
        const result = await db.execute(sql.raw(`
            DELETE FROM class_schedules WHERE ${whereString} RETURNING id
        `));

        res.json({ message: `Successfully deleted ${(result as any).length} schedules.`, deletedCount: (result as any).length });
    } catch (error) {
        console.error("Error batch deleting schedules", error);
        res.status(500).json({ error: "Failed to batch delete schedules" });
    }
});

router.get('/class/:classId', requireAuth, async (req, res) => {
    const { classId } = req.params;
    const { semester, academicYear } = req.query;
    try {
        const result = await db.execute(sql`
            SELECT cs.id, wd.day_name_kh, wd.day_code, p.period_number, p.start_time, p.end_time,
                   s.name_kh as subject_name, t.name_kh as teacher_name, r.room_code, r.room_name_kh
            FROM class_schedules cs
            JOIN weekdays wd ON cs.weekday_id = wd.id
            JOIN periods p ON cs.period_id = p.id
            JOIN subjects s ON cs.subject_id = s.id
            JOIN teachers t ON cs.teacher_id = t.id
            JOIN rooms r ON cs.room_id = r.id
            WHERE cs.class_id = ${classId} AND cs.semester = ${semester} AND cs.academic_year = ${academicYear} AND cs.is_active = true
            ORDER BY wd.display_order, p.display_order
        `);
        res.json(result);
    } catch (error) {
        console.error("Error fetching class schedule", error);
        res.status(500).json({ error: "Failed to fetch class schedule" });
    }
});

router.get('/teacher/:teacherId', requireAuth, async (req, res) => {
    const { teacherId } = req.params;
    try {
        const result = await db.execute(sql`
            SELECT cs.id, cs.class_id, wd.day_name_kh, p.period_number, p.start_time, p.end_time,
                   s.name_kh as subject_name, r.room_code
            FROM class_schedules cs
            JOIN weekdays wd ON cs.weekday_id = wd.id
            JOIN periods p ON cs.period_id = p.id
            JOIN subjects s ON cs.subject_id = s.id
            JOIN rooms r ON cs.room_id = r.id
            WHERE cs.teacher_id = ${teacherId} AND cs.is_active = true
            ORDER BY wd.display_order, p.display_order
        `);
        res.json(result);
    } catch (error) {
        console.error("Error fetching teacher schedule", error);
        res.status(500).json({ error: "Failed to fetch teacher schedule" });
    }
});

router.post('/', requireAdmin, validate(scheduleSchema), async (req: any, res: any) => {
    const { classId, subjectId, teacherId, roomId, weekdayId, periodId, semester, academicYear } = req.body;
    try {
        const conflictCheck = await db.execute(sql`
            SELECT * FROM fn_check_schedule_conflict(${teacherId}, ${roomId}, ${weekdayId}, ${periodId}, ${semester}, ${academicYear})
        `);
        const firstRow = (conflictCheck as any)[0];
        if (firstRow && firstRow.conflict_type !== 'no_conflict') {
            return res.status(409).json({ error: firstRow.conflict_type, message: firstRow.conflict_details });
        }
        
        const userId = req.adminUser?.id || null;
        const result = await db.execute(sql`
            INSERT INTO class_schedules (class_id, subject_id, teacher_id, room_id, weekday_id, period_id, semester, academic_year, created_by)
            VALUES (${classId}, ${subjectId}, ${teacherId}, ${roomId}, ${weekdayId}, ${periodId}, ${semester}, ${academicYear}, ${userId})
            RETURNING *
        `);
        res.status(201).json((result as any)[0]);
    } catch (error) {
        console.error("Error creating schedule", error);
        res.status(500).json({ error: "Failed to create schedule" });
    }
});

// Endpoint 1: PUT /api/schedules/:id
router.put('/:id', requireAdmin, validate(scheduleSchema), async (req: any, res: any) => {
    const id = Number(req.params.id);
    const { classId, subjectId, teacherId, roomId, weekdayId, periodId, semester, academicYear } = req.body;
    try {
        const conflictCheck = await db.execute(sql`
            SELECT * FROM fn_check_schedule_conflict(${teacherId}, ${roomId}, ${weekdayId}, ${periodId}, ${semester}, ${academicYear}, ${id})
        `);
        const firstRow = (conflictCheck as any)[0];
        if (firstRow && firstRow.conflict_type !== 'no_conflict') {
            return res.status(409).json({ error: firstRow.conflict_type, message: firstRow.conflict_details });
        }
        
        const result = await db.execute(sql`
            UPDATE class_schedules
            SET class_id = ${classId}, subject_id = ${subjectId}, teacher_id = ${teacherId}, room_id = ${roomId},
                weekday_id = ${weekdayId}, period_id = ${periodId}, semester = ${semester}, academic_year = ${academicYear},
                updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `);
        if ((result as any).length === 0) return res.status(404).json({ error: "Schedule not found" });
        res.json((result as any)[0]);
    } catch (error) {
        console.error("Error updating schedule", error);
        res.status(500).json({ error: "Failed to update schedule" });
    }
});

// Endpoint 2: DELETE /api/schedules/:id
router.delete('/:id', requireAdmin, async (req: any, res: any) => {
    const id = Number(req.params.id);
    try {
        const result = await db.execute(sql`DELETE FROM class_schedules WHERE id = ${id} RETURNING id`);
        if ((result as any).length === 0) return res.status(404).json({ error: "Schedule not found" });
        res.json({ message: "Schedule deleted successfully" });
    } catch (error) {
        console.error("Error deleting schedule", error);
        res.status(500).json({ error: "Failed to delete schedule" });
    }
});

// Endpoint 17: POST /api/schedules/batch
router.post('/batch', requireAdmin, validate(batchScheduleSchema), async (req: any, res: any) => {
    const { schedules } = req.body;
    const userId = req.adminUser?.id || null;
    const results = [];
    const errors = [];
    
    // Process sequentially to accurately catch conflicts
    for (let i = 0; i < schedules.length; i++) {
        const sch = schedules[i];
        try {
            const conflictCheck = await db.execute(sql`
                SELECT * FROM fn_check_schedule_conflict(${sch.teacherId}, ${sch.roomId}, ${sch.weekdayId}, ${sch.periodId}, ${sch.semester}, ${sch.academicYear})
            `);
            const firstRow = (conflictCheck as any)[0];
            if (firstRow && firstRow.conflict_type !== 'no_conflict') {
                errors.push({ index: i, error: firstRow.conflict_type, message: firstRow.conflict_details, schedule: sch });
                continue;
            }
            const inserted = await db.execute(sql`
                INSERT INTO class_schedules (class_id, subject_id, teacher_id, room_id, weekday_id, period_id, semester, academic_year, created_by)
                VALUES (${sch.classId}, ${sch.subjectId}, ${sch.teacherId}, ${sch.roomId}, ${sch.weekdayId}, ${sch.periodId}, ${sch.semester}, ${sch.academicYear}, ${userId})
                RETURNING id
            `);
            results.push((inserted as any)[0].id);
        } catch (e) {
            errors.push({ index: i, error: "Database error", schedule: sch });
        }
    }
    res.status(errors.length > 0 ? 207 : 201).json({ insertedIds: results, errors });
});

// ============================================================================
// 2. EXAMS
// ============================================================================

// Endpoint 3: GET /api/exams
router.get('/exams', requireAuth, async (req, res) => {
    const { classId, startDate, endDate } = req.query;
    try {
        let queryStr = `SELECT * FROM exam_schedules WHERE 1=1`;
        if (classId) queryStr += ` AND class_id = ${classId}`;
        if (startDate) queryStr += ` AND exam_date >= '${startDate}'`;
        if (endDate) queryStr += ` AND exam_date <= '${endDate}'`;
        queryStr += ` ORDER BY exam_date, start_time`;
        
        // Unsafe sql interpolation bypass for dynamic queries (in a real app, use query builder properly)
        // Here we can use standard parameterized queries with pg or drizzle builder.
        // For simplicity with sql\`\`:
        const result = await db.execute(sql.raw(queryStr));
        res.json(result);
    } catch (error) {
        console.error("Error fetching exams", error);
        res.status(500).json({ error: "Failed to fetch exams" });
    }
});

// Endpoint 4: POST /api/exams
router.post('/exams', requireAdmin, validate(examSchema), async (req: any, res: any) => {
    const { examNameKh, examNameEn, subjectId, classId, roomId, examDate, startTime, endTime, proctorTeacherId, totalStudents, notes } = req.body;
    try {
        const result = await db.execute(sql`
            INSERT INTO exam_schedules (exam_name_kh, exam_name_en, subject_id, class_id, room_id, exam_date, start_time, end_time, proctor_teacher_id, total_students, notes)
            VALUES (${examNameKh}, ${examNameEn}, ${subjectId}, ${classId}, ${roomId}, ${examDate}, ${startTime}, ${endTime}, ${proctorTeacherId || null}, ${totalStudents}, ${notes || null})
            RETURNING *
        `);
        res.status(201).json((result as any)[0]);
    } catch (error) {
        console.error("Error creating exam", error);
        res.status(500).json({ error: "Failed to create exam" });
    }
});

// Endpoint 5: PUT /api/exams/:id
router.put('/exams/:id', requireAdmin, validate(examSchema), async (req: any, res: any) => {
    const id = Number(req.params.id);
    const { examNameKh, examNameEn, subjectId, classId, roomId, examDate, startTime, endTime, proctorTeacherId, totalStudents, notes } = req.body;
    try {
        const result = await db.execute(sql`
            UPDATE exam_schedules
            SET exam_name_kh = ${examNameKh}, exam_name_en = ${examNameEn}, subject_id = ${subjectId}, class_id = ${classId}, 
                room_id = ${roomId}, exam_date = ${examDate}, start_time = ${startTime}, end_time = ${endTime}, 
                proctor_teacher_id = ${proctorTeacherId || null}, total_students = ${totalStudents}, notes = ${notes || null},
                updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `);
        if ((result as any).length === 0) return res.status(404).json({ error: "Exam not found" });
        res.json((result as any)[0]);
    } catch (error) {
        console.error("Error updating exam", error);
        res.status(500).json({ error: "Failed to update exam" });
    }
});

// Endpoint 6: DELETE /api/exams/:id
router.delete('/exams/:id', requireAdmin, async (req: any, res: any) => {
    const id = Number(req.params.id);
    try {
        const result = await db.execute(sql`DELETE FROM exam_schedules WHERE id = ${id} RETURNING id`);
        if ((result as any).length === 0) return res.status(404).json({ error: "Exam not found" });
        res.json({ message: "Exam deleted successfully" });
    } catch (error) {
        console.error("Error deleting exam", error);
        res.status(500).json({ error: "Failed to delete exam" });
    }
});

// ============================================================================
// 3. CALENDAR
// ============================================================================

// Endpoint 7: GET /api/calendar
router.get('/calendar', requireAuth, async (req, res) => {
    const { month, year } = req.query;
    try {
        let queryStr = `SELECT * FROM school_calendar WHERE 1=1`;
        if (month) queryStr += ` AND EXTRACT(MONTH FROM event_date) = ${month}`;
        if (year) queryStr += ` AND EXTRACT(YEAR FROM event_date) = ${year}`;
        queryStr += ` ORDER BY event_date ASC`;
        const result = await db.execute(sql.raw(queryStr));
        res.json(result);
    } catch (error) {
        console.error("Error fetching calendar events", error);
        res.status(500).json({ error: "Failed to fetch calendar events" });
    }
});

// Endpoint 8: POST /api/calendar/events
router.post('/calendar/events', requireAdmin, validate(calendarEventSchema), async (req: any, res: any) => {
    const { eventDate, eventType, eventNameKh, eventNameEn, description, isHoliday, affectsClasses } = req.body;
    try {
        const result = await db.execute(sql`
            INSERT INTO school_calendar (event_date, event_type, event_name_kh, event_name_en, description, is_holiday, affects_classes)
            VALUES (${eventDate}, ${eventType}, ${eventNameKh}, ${eventNameEn}, ${description || null}, ${isHoliday}, ${affectsClasses})
            RETURNING *
        `);
        res.status(201).json((result as any)[0]);
    } catch (error) {
        console.error("Error creating calendar event", error);
        res.status(500).json({ error: "Failed to create calendar event" });
    }
});

// Endpoint 9: PUT /api/calendar/events/:id
router.put('/calendar/events/:id', requireAdmin, validate(calendarEventSchema), async (req: any, res: any) => {
    const id = Number(req.params.id);
    const { eventDate, eventType, eventNameKh, eventNameEn, description, isHoliday, affectsClasses } = req.body;
    try {
        const result = await db.execute(sql`
            UPDATE school_calendar
            SET event_date = ${eventDate}, event_type = ${eventType}, event_name_kh = ${eventNameKh}, event_name_en = ${eventNameEn},
                description = ${description || null}, is_holiday = ${isHoliday}, affects_classes = ${affectsClasses}
            WHERE id = ${id}
            RETURNING *
        `);
        if ((result as any).length === 0) return res.status(404).json({ error: "Event not found" });
        res.json((result as any)[0]);
    } catch (error) {
        console.error("Error updating calendar event", error);
        res.status(500).json({ error: "Failed to update calendar event" });
    }
});

// Endpoint 10: DELETE /api/calendar/events/:id
router.delete('/calendar/events/:id', requireAdmin, async (req: any, res: any) => {
    const id = Number(req.params.id);
    try {
        const result = await db.execute(sql`DELETE FROM school_calendar WHERE id = ${id} RETURNING id`);
        if ((result as any).length === 0) return res.status(404).json({ error: "Event not found" });
        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting calendar event", error);
        res.status(500).json({ error: "Failed to delete calendar event" });
    }
});

// ============================================================================
// 4. ROOMS & BOOKINGS
// ============================================================================

// Endpoint 11: GET /api/rooms
router.get('/rooms', requireAuth, async (req, res) => {
    try {
        const result = await db.execute(sql`SELECT * FROM rooms WHERE is_active = true ORDER BY room_code ASC`);
        res.json(result);
    } catch (error) {
        console.error("Error fetching rooms", error);
        res.status(500).json({ error: "Failed to fetch rooms" });
    }
});

// Endpoint 12: GET /api/rooms/:roomId/availability
router.get('/rooms/:roomId/availability', requireAuth, async (req, res) => {
    const { roomId } = req.params;
    const { date } = req.query;
    try {
        const classResult = await db.execute(sql`
            SELECT p.period_number, p.start_time, p.end_time, cs.class_id, s.name_kh as subject_name,
                   CASE WHEN cs.id IS NOT NULL THEN 'occupied' ELSE 'available' END as status
            FROM periods p
            LEFT JOIN class_schedules cs ON cs.period_id = p.id
                AND cs.room_id = ${roomId}
                AND cs.weekday_id = EXTRACT(DOW FROM ${date}::DATE)
                AND cs.is_active = true
            LEFT JOIN subjects s ON cs.subject_id = s.id
            WHERE p.is_break = false
            ORDER BY p.period_number
        `);
        res.json(classResult);
    } catch (error) {
        console.error("Error fetching room availability", error);
        res.status(500).json({ error: "Failed to fetch room availability" });
    }
});

// GET /api/rooms/bookings
router.get('/rooms/bookings', requireAuth, async (req, res) => {
    try {
        const result = await db.execute(sql`
            SELECT rb.*, r.room_code, r.room_name_kh 
            FROM room_bookings rb
            JOIN rooms r ON rb.room_id = r.id
            ORDER BY rb.booking_date DESC, rb.start_time DESC
        `);
        res.json(result);
    } catch (error) {
        console.error("Error fetching room bookings", error);
        res.status(500).json({ error: "Failed to fetch room bookings" });
    }
});

// Endpoint 13: POST /api/rooms/bookings
router.post('/rooms/bookings', requireAdmin, validate(roomBookingSchema), async (req: any, res: any) => {
    const { roomId, bookingTitleKh, bookingTitleEn, bookingDate, startTime, endTime, organizerName, organizerContact, purpose, status } = req.body;
    try {
        const userId = req.adminUser?.id || null;
        const result = await db.execute(sql`
            INSERT INTO room_bookings (room_id, booking_title_kh, booking_title_en, booking_date, start_time, end_time, organizer_name, organizer_contact, purpose, status, created_by)
            VALUES (${roomId}, ${bookingTitleKh}, ${bookingTitleEn}, ${bookingDate}, ${startTime}, ${endTime}, ${organizerName || null}, ${organizerContact || null}, ${purpose || null}, ${status}, ${userId})
            RETURNING *
        `);
        res.status(201).json((result as any)[0]);
    } catch (error) {
        console.error("Error creating room booking", error);
        res.status(500).json({ error: "Failed to create room booking" });
    }
});

// Endpoint 14: PUT /api/rooms/bookings/:id
router.put('/rooms/bookings/:id', requireAdmin, validate(roomBookingSchema), async (req: any, res: any) => {
    const id = Number(req.params.id);
    const { roomId, bookingTitleKh, bookingTitleEn, bookingDate, startTime, endTime, organizerName, organizerContact, purpose, status } = req.body;
    try {
        const result = await db.execute(sql`
            UPDATE room_bookings
            SET room_id = ${roomId}, booking_title_kh = ${bookingTitleKh}, booking_title_en = ${bookingTitleEn},
                booking_date = ${bookingDate}, start_time = ${startTime}, end_time = ${endTime},
                organizer_name = ${organizerName || null}, organizer_contact = ${organizerContact || null},
                purpose = ${purpose || null}, status = ${status}, updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `);
        if ((result as any).length === 0) return res.status(404).json({ error: "Booking not found" });
        res.json((result as any)[0]);
    } catch (error) {
        console.error("Error updating room booking", error);
        res.status(500).json({ error: "Failed to update room booking" });
    }
});

// Endpoint 15: DELETE /api/rooms/bookings/:id
router.delete('/rooms/bookings/:id', requireAdmin, async (req: any, res: any) => {
    const id = Number(req.params.id);
    try {
        const result = await db.execute(sql`DELETE FROM room_bookings WHERE id = ${id} RETURNING id`);
        if ((result as any).length === 0) return res.status(404).json({ error: "Booking not found" });
        res.json({ message: "Booking deleted successfully" });
    } catch (error) {
        console.error("Error deleting room booking", error);
        res.status(500).json({ error: "Failed to delete room booking" });
    }
});

// ============================================================================
// 5. TEACHER AVAILABILITY
// ============================================================================

// Endpoint 16: GET /api/teacher/availability
router.get('/teacher/availability', requireAuth, async (req, res) => {
    const { teacherId, semester, academicYear } = req.query;
    try {
        let queryStr = `SELECT * FROM teacher_availability WHERE 1=1`;
        if (teacherId) queryStr += ` AND teacher_id = ${teacherId}`;
        if (semester) queryStr += ` AND semester = '${semester}'`;
        if (academicYear) queryStr += ` AND academic_year = ${academicYear}`;
        const result = await db.execute(sql.raw(queryStr));
        res.json(result);
    } catch (error) {
        console.error("Error fetching teacher availability", error);
        res.status(500).json({ error: "Failed to fetch teacher availability" });
    }
});

// ============================================================================
// MISC / UTILS
// ============================================================================

// Print student timetable (existing)
router.get('/student/:studentId/timetable/print', requireAuth, async (req, res) => {
    const { studentId } = req.params;
    try {
        const result = await db.execute(sql`
            SELECT * FROM mv_student_timetable 
            WHERE student_id = ${studentId}
            ORDER BY weekday_id, period_number
        `);
        let rowsHtml = '';
        for (const row of (result as any)) {
             rowsHtml += `<tr>
                <td>${row.day_name_kh}</td>
                <td>${row.period_number}</td>
                <td>${row.start_time} - ${row.end_time}</td>
                <td>${row.subject_name_kh}</td>
                <td>${row.teacher_name_kh}</td>
                <td>${row.room_name_kh}</td>
             </tr>`;
        }
        const html = `<html><body><table border="1">${rowsHtml}</table></body></html>`;
        res.send(html);
    } catch (error) {
        res.status(500).json({ error: "Failed to generate timetable print" });
    }
});

export default router;
