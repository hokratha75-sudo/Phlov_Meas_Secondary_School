-- ============================================================================
-- Phlov Meas Secondary School - Phase 3: Stored Procedures & Functions
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SCHEMA PATCHES
-- ----------------------------------------------------------------------------
ALTER TABLE students ADD COLUMN IF NOT EXISTS dob DATE;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_dob ON students(dob);

-- ----------------------------------------------------------------------------
-- 3.1 STUDENT MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_enroll_student(
    p_student_id TEXT, p_name_kh TEXT, p_name_en TEXT, p_grade TEXT, 
    p_class_id INT, p_gender TEXT, p_enrollment_year INT, p_dob DATE, 
    p_phone TEXT, p_parent_phone TEXT, p_address TEXT
) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO students (student_id, name_kh, name_en, grade, class_id, gender, enrollment_year, dob, phone, parent_phone, address, status, created_at, updated_at) 
    VALUES (p_student_id, p_name_kh, p_name_en, p_grade, p_class_id, p_gender, p_enrollment_year, p_dob, p_phone, p_parent_phone, p_address, 'active', NOW(), NOW());
END; $$;

CREATE OR REPLACE PROCEDURE sp_promote_students(p_current_grade TEXT, p_next_grade TEXT, p_academic_year INT) LANGUAGE plpgsql AS $$
BEGIN
    UPDATE students SET grade = p_next_grade, enrollment_year = p_academic_year, updated_at = NOW() WHERE grade = p_current_grade AND status = 'active';
END; $$;

CREATE OR REPLACE PROCEDURE sp_transfer_student(p_student_pk INT, p_new_grade TEXT, p_new_class_id INT) LANGUAGE plpgsql AS $$
BEGIN
    UPDATE students SET grade = p_new_grade, class_id = p_new_class_id, updated_at = NOW() WHERE id = p_student_pk;
END; $$;

CREATE OR REPLACE PROCEDURE sp_graduate_students() LANGUAGE plpgsql AS $$
BEGIN
    UPDATE students SET status = 'graduated', updated_at = NOW() WHERE grade = '12' AND status = 'active';
END; $$;

-- ----------------------------------------------------------------------------
-- 3.2 GRADE MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_calculate_gpa(p_student_id INT, p_academic_year VARCHAR(20)) RETURNS DECIMAL(5,2) LANGUAGE plpgsql AS $$
DECLARE v_gpa DECIMAL(5,2);
BEGIN
    SELECT COALESCE(AVG(score), 0) INTO v_gpa FROM student_monthly_scores WHERE student_id = p_student_id AND academic_year = p_academic_year;
    RETURN v_gpa;
END; $$;

CREATE OR REPLACE FUNCTION fn_generate_report_card(p_student_id INT, p_academic_year VARCHAR(20)) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'student', (SELECT jsonb_build_object('name_kh', name_kh, 'grade', grade) FROM students WHERE id = p_student_id),
        'scores', COALESCE((SELECT jsonb_agg(jsonb_build_object('month', month, 'subject', subject, 'score', score)) FROM student_monthly_scores WHERE student_id = p_student_id AND academic_year = p_academic_year), '[]'::jsonb),
        'gpa', fn_calculate_gpa(p_student_id, p_academic_year)
    ) INTO v_result;
    RETURN v_result;
END; $$;

CREATE OR REPLACE PROCEDURE sp_import_monthly_scores(p_data JSONB) LANGUAGE plpgsql AS $$
DECLARE item JSONB;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(p_data) LOOP
        INSERT INTO student_monthly_scores (student_id, class_id, academic_year, month, subject, score, created_at, updated_at)
        VALUES ((item->>'student_id')::INT, (item->>'class_id')::INT, item->>'academic_year', item->>'month', item->>'subject', (item->>'score')::NUMERIC, NOW(), NOW())
        ON CONFLICT (student_id, academic_year, month, subject) DO UPDATE SET score = EXCLUDED.score, updated_at = NOW();
    END LOOP;
END; $$;

CREATE OR REPLACE FUNCTION fn_class_rank(p_student_id INT, p_exam_period VARCHAR(50), p_academic_year VARCHAR(20)) RETURNS INT LANGUAGE plpgsql AS $$
DECLARE v_rank INT;
BEGIN
    WITH RankedGrades AS (
        SELECT student_id, RANK() OVER (PARTITION BY classroom_id ORDER BY total_score DESC) as calculated_rank
        FROM student_grades WHERE academic_year = p_academic_year AND exam_period = p_exam_period
    )
    SELECT calculated_rank INTO v_rank FROM RankedGrades WHERE student_id = p_student_id;
    RETURN COALESCE(v_rank, 0);
END; $$;

-- ----------------------------------------------------------------------------
-- 3.3 ATTENDANCE PROCEDURES
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_mark_class_attendance(p_class_id INT, p_academic_year TEXT, p_date TEXT, p_shift TEXT, p_subject TEXT, p_attendance_data JSONB) LANGUAGE plpgsql AS $$
DECLARE item JSONB;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(p_attendance_data) LOOP
        INSERT INTO student_attendance (student_id, classroom_id, academic_year, date, shift, subject, status, remarks, created_at, updated_at)
        VALUES ((item->>'student_id')::INT, p_class_id, p_academic_year, p_date, p_shift, p_subject, item->>'status', item->>'remarks', NOW(), NOW())
        ON CONFLICT (student_id, date, shift, subject) DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks, updated_at = NOW();
    END LOOP;
END; $$;

CREATE OR REPLACE FUNCTION fn_attendance_report(p_class_id INT, p_month_prefix TEXT) RETURNS TABLE(student_name TEXT, total_days BIGINT, present BIGINT, absent BIGINT) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT s.name_kh as student_name, COUNT(a.id) as total_days,
           SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
           SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent
    FROM students s LEFT JOIN student_attendance a ON s.id = a.student_id AND a.date LIKE p_month_prefix || '%'
    WHERE s.class_id = p_class_id GROUP BY s.id, s.name_kh;
END; $$;

CREATE OR REPLACE FUNCTION sp_check_absence_warnings() RETURNS TABLE(student_id INT, name_kh TEXT, absence_count BIGINT) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT s.id as student_id, s.name_kh, COUNT(a.id) as absence_count
    FROM students s JOIN student_attendance a ON s.id = a.student_id
    WHERE a.status = 'absent' AND s.status = 'active'
    GROUP BY s.id, s.name_kh HAVING COUNT(a.id) > 3;
END; $$;

-- ----------------------------------------------------------------------------
-- 3.4 LIBRARY PROCEDURES
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_borrow_book(p_student_id INT, p_book_title TEXT, p_book_code TEXT, p_due_date TIMESTAMP) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO library_logs (student_id, book_title, book_code, borrow_date, due_date, book_status, created_at, updated_at)
    VALUES (p_student_id, p_book_title, p_book_code, NOW(), p_due_date, 'borrowed', NOW(), NOW());
END; $$;

CREATE OR REPLACE FUNCTION fn_return_book(p_log_id INT) RETURNS DECIMAL LANGUAGE plpgsql AS $$
DECLARE v_due_date TIMESTAMP; v_fine DECIMAL := 0; v_days_late INT;
BEGIN
    SELECT due_date INTO v_due_date FROM library_logs WHERE id = p_log_id AND book_status = 'borrowed';
    IF v_due_date IS NULL THEN RETURN 0; END IF;
    IF NOW() > v_due_date THEN
        v_days_late := EXTRACT(DAY FROM (NOW() - v_due_date));
        v_fine := v_days_late * 0.50; -- $0.50 per day late
    END IF;
    UPDATE library_logs SET return_date = NOW(), book_status = 'returned', updated_at = NOW() WHERE id = p_log_id;
    RETURN v_fine;
END; $$;

CREATE OR REPLACE FUNCTION fn_overdue_books() RETURNS TABLE(student_name TEXT, book_title TEXT, days_overdue INT, fine DECIMAL) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT s.name_kh as student_name, l.book_title, EXTRACT(DAY FROM (NOW() - l.due_date))::INT as days_overdue,
           (EXTRACT(DAY FROM (NOW() - l.due_date)) * 0.50)::DECIMAL as fine
    FROM library_logs l JOIN students s ON l.student_id = s.id
    WHERE l.book_status = 'borrowed' AND l.due_date < NOW();
END; $$;

-- ----------------------------------------------------------------------------
-- 3.5 LEAVE REQUEST PROCEDURES
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_submit_leave(p_teacher_id INT, p_leave_type TEXT, p_total_days INT, p_start_date TEXT, p_end_date TEXT, p_reason TEXT, p_address TEXT) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO teacher_leaves (teacher_id, leave_type, total_days, start_date, end_date, reason, address_during_leave, status, created_at, updated_at)
    VALUES (p_teacher_id, p_leave_type, p_total_days, p_start_date, p_end_date, p_reason, p_address, 'PENDING', NOW(), NOW());
END; $$;

CREATE OR REPLACE PROCEDURE sp_approve_leave(p_request_id INT, p_admin_note TEXT) LANGUAGE plpgsql AS $$
BEGIN
    UPDATE teacher_leaves SET status = 'APPROVED', admin_note = p_admin_note, updated_at = NOW() WHERE id = p_request_id;
END; $$;

CREATE OR REPLACE PROCEDURE sp_init_leave_balances(p_academic_year TEXT) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO teacher_leave_balances (teacher_id, academic_year, annual_leave, sick_leave, personal_leave, maternity_leave, created_at, updated_at)
    SELECT id, p_academic_year, 18, 10, 5, 90, NOW(), NOW() FROM teachers
    ON CONFLICT DO NOTHING;
END; $$;

-- ----------------------------------------------------------------------------
-- 3.6 ADMINISTRATIVE PROCEDURES
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_archive_old_records(p_attendance_years INT, p_logs_years INT) LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM student_attendance WHERE CAST(date AS DATE) < NOW() - (p_attendance_years || ' years')::INTERVAL;
    DELETE FROM library_logs WHERE return_date IS NOT NULL AND return_date < NOW() - (p_logs_years || ' years')::INTERVAL;
END; $$;

CREATE OR REPLACE FUNCTION fn_annual_school_report(p_academic_year TEXT) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE v_report JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_active_students', (SELECT COUNT(*) FROM students WHERE status = 'active'),
        'total_teachers', (SELECT COUNT(*) FROM teachers),
        'total_library_borrows', (SELECT COUNT(*) FROM library_logs),
        'attendance_rate', (SELECT COALESCE(AVG(CASE WHEN status = 'present' THEN 100 ELSE 0 END), 0) FROM student_attendance WHERE academic_year = p_academic_year)
    ) INTO v_report;
    RETURN v_report;
END; $$;

CREATE OR REPLACE FUNCTION fn_get_site_settings() RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE v_settings JSONB;
BEGIN
    SELECT jsonb_build_object('school_name', school_name, 'principal_name', principal_name) INTO v_settings FROM site_settings LIMIT 1;
    RETURN COALESCE(v_settings, '{}'::jsonb);
END; $$;
