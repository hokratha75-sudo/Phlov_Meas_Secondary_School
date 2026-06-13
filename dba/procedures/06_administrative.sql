-- ============================================================================
-- 06. ADMINISTRATIVE PROCEDURES
-- ============================================================================

-- Archive old records (attendance > X years, logs > Y years)
CREATE OR REPLACE PROCEDURE sp_archive_old_records(p_attendance_years INT, p_logs_years INT) LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM student_attendance WHERE CAST(date AS DATE) < NOW() - (p_attendance_years || ' years')::INTERVAL;
    DELETE FROM library_logs WHERE return_date IS NOT NULL AND return_date < NOW() - (p_logs_years || ' years')::INTERVAL;
END; $$;

-- Generate annual school report
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

-- Sync site_settings to application cache
CREATE OR REPLACE FUNCTION fn_get_site_settings() RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE v_settings JSONB;
BEGIN
    SELECT jsonb_build_object('school_name', school_name, 'principal_name', principal_name) INTO v_settings FROM site_settings LIMIT 1;
    RETURN COALESCE(v_settings, '{}'::jsonb);
END; $$;
