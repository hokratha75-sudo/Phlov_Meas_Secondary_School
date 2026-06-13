import express from 'express';
import { db } from '@workspace/db';
import { sql } from 'drizzle-orm';
import { requireAuth } from './auth';

const router = express.Router();

/**
 * GET /api/schedule
 * Fetch class schedules using raw SQL
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { classId, teacherId } = req.query;

    let scheduleQuery;

    if (classId) {
      scheduleQuery = sql`
        SELECT 
            cs.id,
            cs.class_id,
            cs.subject_id,
            s.name_kh as subject_name_kh,
            s.name_en as subject_name_en,
            t.name_kh as teacher_name_kh,
            r.room_code,
            r.room_name_kh,
            wd.day_name_kh,
            wd.day_code,
            p.period_number,
            p.start_time,
            p.end_time
        FROM class_schedules cs
        JOIN subjects s ON cs.subject_id = s.id
        JOIN teachers t ON cs.teacher_id = t.id
        JOIN rooms r ON cs.room_id = r.id
        JOIN weekdays wd ON cs.weekday_id = wd.id
        JOIN periods p ON cs.period_id = p.id
        WHERE cs.class_id = ${Number(classId)}
        ORDER BY wd.display_order, p.period_number
      `;
    } else if (teacherId) {
      scheduleQuery = sql`
        SELECT 
            cs.id,
            cs.class_id,
            cs.subject_id,
            s.name_kh as subject_name_kh,
            s.name_en as subject_name_en,
            c.name as class_name,
            r.room_code,
            r.room_name_kh,
            wd.day_name_kh,
            wd.day_code,
            p.period_number,
            p.start_time,
            p.end_time
        FROM class_schedules cs
        JOIN subjects s ON cs.subject_id = s.id
        JOIN classrooms c ON cs.class_id = c.id
        JOIN rooms r ON cs.room_id = r.id
        JOIN weekdays wd ON cs.weekday_id = wd.id
        JOIN periods p ON cs.period_id = p.id
        WHERE cs.teacher_id = ${Number(teacherId)}
        ORDER BY wd.display_order, p.period_number
      `;
    } else {
      return res.status(400).json({ error: 'Missing classId or teacherId' });
    }

    const result = await db.execute(scheduleQuery);
    res.json(result.rows);
    return;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

export default router;
