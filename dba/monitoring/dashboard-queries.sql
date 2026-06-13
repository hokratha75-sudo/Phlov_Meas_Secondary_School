-- ============================================================================
-- Phlov Meas Secondary School - Dashboard Queries
-- ============================================================================
-- These queries are highly optimized for dashboard consumption.

-- 1. Daily Attendance Summary (Uses Materialized View)
SELECT * FROM mv_daily_attendance_summary 
WHERE date = CURRENT_DATE::text;

-- 2. Current Active Borrowings Count
SELECT COUNT(*) as active_borrows
FROM library_logs
WHERE book_status = 'borrowed';

-- 3. Top 5 Overdue Books
SELECT s.name_kh, l.book_title, EXTRACT(DAY FROM (NOW() - l.due_date))::INT as days_late
FROM library_logs l
JOIN students s ON l.student_id = s.id
WHERE l.book_status = 'borrowed' AND l.due_date < NOW()
ORDER BY days_late DESC
LIMIT 5;

-- 4. Pending Leave Requests Count
SELECT COUNT(*) as pending_leaves
FROM teacher_leaves
WHERE status = 'PENDING';
