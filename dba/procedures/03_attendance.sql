-- ============================================================================
-- 03. ATTENDANCE PROCEDURES
-- ============================================================================

-- Mark daily attendance for entire class
CREATE OR REPLACE PROCEDURE sp_mark_class_attendance(p_class_id INT, p_academic_year TEXT, p_date TEXT, p_shift TEXT, p_subject TEXT, p_attendance_data JSONB) LANGUAGE plpgsql AS $$
DECLARE item JSONB;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(p_attendance_data) LOOP
        INSERT INTO student_attendance (student_id, classroom_id, academic_year, date, shift, subject, status, remarks, created_at, updated_at)
        VALUES ((item->>'student_id')::INT, p_class_id, p_academic_year, p_date, p_shift, p_subject, item->>'status', item->>'remarks', NOW(), NOW())
        ON CONFLICT (student_id, date, shift, subject) DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks, updated_at = NOW();
    END LOOP;
END; $$;

-- Generate monthly attendance report
CREATE OR REPLACE FUNCTION fn_attendance_report(p_class_id INT, p_month_prefix TEXT) RETURNS TABLE(student_name TEXT, total_days BIGINT, present BIGINT, absent BIGINT) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT s.name_kh as student_name, COUNT(a.id) as total_days,
           SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
           SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent
    FROM students s LEFT JOIN student_attendance a ON s.id = a.student_id AND a.date LIKE p_month_prefix || '%'
    WHERE s.class_id = p_class_id GROUP BY s.id, s.name_kh;
END; $$;

-- Auto-warning for excessive absences (> 3 days for example)
CREATE OR REPLACE FUNCTION sp_check_absence_warnings() RETURNS TABLE(student_id INT, name_kh TEXT, absence_count BIGINT) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT s.id as student_id, s.name_kh, COUNT(a.id) as absence_count
    FROM students s JOIN student_attendance a ON s.id = a.student_id
    WHERE a.status = 'absent' AND s.status = 'active'
    GROUP BY s.id, s.name_kh HAVING COUNT(a.id) > 3;
END; $$;
