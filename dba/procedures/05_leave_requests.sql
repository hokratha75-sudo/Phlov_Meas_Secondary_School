-- ============================================================================
-- 05. LEAVE REQUEST PROCEDURES
-- ============================================================================

-- Submit leave request
CREATE OR REPLACE PROCEDURE sp_submit_leave(p_teacher_id INT, p_leave_type TEXT, p_total_days INT, p_start_date TEXT, p_end_date TEXT, p_reason TEXT, p_address TEXT) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO teacher_leaves (teacher_id, leave_type, total_days, start_date, end_date, reason, address_during_leave, status, created_at, updated_at)
    VALUES (p_teacher_id, p_leave_type, p_total_days, p_start_date, p_end_date, p_reason, p_address, 'PENDING', NOW(), NOW());
END; $$;

-- Approve leave
CREATE OR REPLACE PROCEDURE sp_approve_leave(p_request_id INT, p_admin_note TEXT) LANGUAGE plpgsql AS $$
BEGIN
    UPDATE teacher_leaves SET status = 'APPROVED', admin_note = p_admin_note, updated_at = NOW() WHERE id = p_request_id;
END; $$;

-- Auto-calculate leave balance for new year
CREATE OR REPLACE PROCEDURE sp_init_leave_balances(p_academic_year TEXT) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO teacher_leave_balances (teacher_id, academic_year, annual_leave, sick_leave, personal_leave, maternity_leave, created_at, updated_at)
    SELECT id, p_academic_year, 18, 10, 5, 90, NOW(), NOW() FROM teachers
    ON CONFLICT DO NOTHING;
END; $$;
