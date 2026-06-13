-- ============================================================================
-- 04. NOTIFICATION TRIGGERS (Pub/Sub)
-- ============================================================================

-- Notify Grade Updates
CREATE OR REPLACE FUNCTION fn_notify_grade_update() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    PERFORM pg_notify('grade_updated', json_build_object('student_id', NEW.student_id, 'subject', NEW.subject, 'old_score', OLD.score, 'new_score', NEW.score)::text);
    RETURN NEW;
END; $$;
CREATE TRIGGER trg_notify_grade_update AFTER UPDATE ON student_monthly_scores FOR EACH ROW WHEN (OLD.score IS DISTINCT FROM NEW.score) EXECUTE FUNCTION fn_notify_grade_update();

-- Notify Leaves
CREATE OR REPLACE FUNCTION fn_notify_leave_approved() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    PERFORM pg_notify('leave_approved', json_build_object('teacher_id', NEW.teacher_id, 'start_date', NEW.start_date, 'end_date', NEW.end_date)::text);
    RETURN NEW;
END; $$;
CREATE TRIGGER trg_notify_leave_approved AFTER UPDATE ON teacher_leaves FOR EACH ROW WHEN (OLD.status = 'PENDING' AND NEW.status = 'APPROVED') EXECUTE FUNCTION fn_notify_leave_approved();
