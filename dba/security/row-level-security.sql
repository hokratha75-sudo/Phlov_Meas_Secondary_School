-- ============================================================================
-- 02. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on students table
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can only view and edit students in their own classes
-- Note: This requires the application to connect via a user with the 'app_teacher' role.
-- Superusers (e.g., 'postgres') automatically bypass RLS.

DROP POLICY IF EXISTS teacher_students_policy ON students;

CREATE POLICY teacher_students_policy ON students
    FOR ALL
    TO app_teacher
    USING (
        class_id IN (
            SELECT id FROM classrooms 
            WHERE main_teacher_id = (
                SELECT id FROM teachers WHERE user_id::text = current_setting('request.jwt.claim.sub', true)
                -- Alternatively, if mapping PG users to Teachers:
                -- WHERE pg_user_name = current_user
            )
        )
    );

-- Policy: Admins can see all students
DROP POLICY IF EXISTS admin_students_policy ON students;
CREATE POLICY admin_students_policy ON students
    FOR ALL
    TO app_admin
    USING (true);
