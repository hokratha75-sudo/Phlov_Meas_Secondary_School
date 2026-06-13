-- -----------------------------------------------------------------------------
-- Phlov Meas Secondary School - Performance Indexes & Materialized Views
-- -----------------------------------------------------------------------------
-- Note: Run this script with a superuser account (e.g., postgres)
-- psql -U postgres -d phlov_meas -f 0002_performance_indexes.sql

-- 1. Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 2. Create Indexes CONCURRENTLY (Requires PostgreSQL 11+)
-- Using CONCURRENTLY prevents locking the tables during index creation.

-- Student searches (used heavily in admin)
-- Using pg_trgm for partial string matching (e.g., searching by partial name)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_name_kh 
ON students USING gin(name_kh gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_grade_class 
ON students(grade, class_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_status 
ON students(status) WHERE status = 'active';

-- Attendance queries (daily use)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_date 
ON student_attendance(date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_student_date 
ON student_attendance(student_id, date);

-- Grade calculations (report generation)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grades_student_semester 
ON student_grades(student_id, semester);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_monthly_scores_student 
ON student_monthly_scores(student_id, academic_year);

-- Library logs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_library_borrowed_date 
ON library_logs(borrowed_date) WHERE returned_date IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_library_student_status 
ON library_logs(student_id, returned_date);

-- Leave requests
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leave_teacher_status 
ON teacher_leaves(teacher_id, status, start_date);

-- 3. Create Materialized Views for Dashboard Statistics

-- Drop if exists to allow safe re-runs
DROP MATERIALIZED VIEW IF EXISTS mv_daily_attendance_summary;

CREATE MATERIALIZED VIEW mv_daily_attendance_summary AS
SELECT 
    sa.date,
    s.class_id,
    COUNT(*) as total_students,
    SUM(CASE WHEN sa.status = 'present' THEN 1 ELSE 0 END) as present,
    SUM(CASE WHEN sa.status = 'absent' THEN 1 ELSE 0 END) as absent,
    SUM(CASE WHEN sa.status = 'permission' THEN 1 ELSE 0 END) as permission,
    SUM(CASE WHEN sa.status = 'late' THEN 1 ELSE 0 END) as late
FROM student_attendance sa
JOIN students s ON sa.student_id = s.id
GROUP BY sa.date, s.class_id;

-- Create a unique index on the materialized view to allow CONCURRENT refreshes
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_attendance_date_class 
ON mv_daily_attendance_summary(date, class_id);

-- -----------------------------------------------------------------------------
-- End of Script
-- -----------------------------------------------------------------------------
