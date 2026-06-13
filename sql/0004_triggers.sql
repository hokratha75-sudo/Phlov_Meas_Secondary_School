-- ============================================================================
-- Phlov Meas Secondary School - Phase 4: Triggers & Auditing
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1 AUDIT TRIGGERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(50),
    record_id INT,
    action VARCHAR(10),
    old_data JSONB,
    new_data JSONB,
    changed_by VARCHAR(50) DEFAULT CURRENT_USER,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION fn_audit_trigger() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log (table_name, record_id, action, old_data)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD)::jsonb);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log (table_name, record_id, action, old_data, new_data)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_log (table_name, record_id, action, new_data)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW)::jsonb);
        RETURN NEW;
    END IF;
    RETURN NULL;
END; $$;

CREATE TRIGGER trg_audit_students AFTER INSERT OR UPDATE OR DELETE ON students FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
CREATE TRIGGER trg_audit_grades AFTER INSERT OR UPDATE OR DELETE ON student_grades FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
CREATE TRIGGER trg_audit_library AFTER INSERT OR UPDATE OR DELETE ON library_logs FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
CREATE TRIGGER trg_audit_leaves AFTER UPDATE ON teacher_leaves FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

-- ----------------------------------------------------------------------------
-- 4.2 BUSINESS RULE TRIGGERS
-- ----------------------------------------------------------------------------
-- Auto-generate student code format: STU-YYYY-XXXX
CREATE OR REPLACE FUNCTION fn_generate_student_code() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_count INT;
BEGIN
    IF NEW.student_id IS NULL OR NEW.student_id = '' THEN
        SELECT COUNT(*) + 1 INTO v_count FROM students WHERE enrollment_year = NEW.enrollment_year;
        NEW.student_id := 'STU-' || NEW.enrollment_year || '-' || LPAD(v_count::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END; $$;
CREATE TRIGGER trg_generate_student_code BEFORE INSERT ON students FOR EACH ROW EXECUTE FUNCTION fn_generate_student_code();

-- Validate grade range (0-100)
CREATE OR REPLACE FUNCTION fn_validate_score_range() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.score < 0 OR NEW.score > 100 THEN
        RAISE EXCEPTION 'Score must be between 0 and 100. Provided: %', NEW.score;
    END IF;
    RETURN NEW;
END; $$;
CREATE TRIGGER trg_validate_score BEFORE INSERT OR UPDATE ON student_monthly_scores FOR EACH ROW EXECUTE FUNCTION fn_validate_score_range();

-- Prevent duplicate active book borrows
CREATE OR REPLACE FUNCTION fn_prevent_duplicate_borrow() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_existing INT;
BEGIN
    SELECT COUNT(*) INTO v_existing FROM library_logs WHERE student_id = NEW.student_id AND book_title = NEW.book_title AND book_status = 'borrowed';
    IF v_existing > 0 THEN
        RAISE EXCEPTION 'Student has already borrowed this book and has not returned it yet.';
    END IF;
    RETURN NEW;
END; $$;
CREATE TRIGGER trg_prevent_duplicate_borrow BEFORE INSERT ON library_logs FOR EACH ROW EXECUTE FUNCTION fn_prevent_duplicate_borrow();

-- Class capacity check (Max 50)
CREATE OR REPLACE FUNCTION fn_check_class_capacity() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_current_count INT;
BEGIN
    IF NEW.class_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_current_count FROM students WHERE class_id = NEW.class_id AND status = 'active';
        IF v_current_count >= 50 THEN
            RAISE EXCEPTION 'Class capacity exceeded. Maximum is 50 students.';
        END IF;
    END IF;
    RETURN NEW;
END; $$;
CREATE TRIGGER trg_check_class_capacity BEFORE INSERT OR UPDATE ON students FOR EACH ROW EXECUTE FUNCTION fn_check_class_capacity();

-- ----------------------------------------------------------------------------
-- 4.3 DATA INTEGRITY TRIGGERS
-- ----------------------------------------------------------------------------
-- Validate student age (10-25)
CREATE OR REPLACE FUNCTION fn_check_student_age() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.dob IS NOT NULL THEN
        IF EXTRACT(YEAR FROM AGE(NEW.dob)) < 10 OR EXTRACT(YEAR FROM AGE(NEW.dob)) > 25 THEN
            RAISE EXCEPTION 'Student age must be between 10 and 25 years old. Current age: %', EXTRACT(YEAR FROM AGE(NEW.dob));
        END IF;
    END IF;
    RETURN NEW;
END; $$;
CREATE TRIGGER trg_check_student_age BEFORE INSERT OR UPDATE ON students FOR EACH ROW EXECUTE FUNCTION fn_check_student_age();

-- Override Cascade: Prevent deletion of students with active library books
CREATE OR REPLACE FUNCTION fn_prevent_delete_student_with_books() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_borrowed_count INT;
BEGIN
    SELECT COUNT(*) INTO v_borrowed_count FROM library_logs WHERE student_id = OLD.id AND book_status = 'borrowed';
    IF v_borrowed_count > 0 THEN
        RAISE EXCEPTION 'Cannot delete student with % outstanding book(s). Please return books first.', v_borrowed_count;
    END IF;
    RETURN OLD;
END; $$;
CREATE TRIGGER trg_prevent_delete_student_with_books BEFORE DELETE ON students FOR EACH ROW EXECUTE FUNCTION fn_prevent_delete_student_with_books();

-- Validate leave dates
CREATE OR REPLACE FUNCTION fn_validate_leave_dates() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF CAST(NEW.end_date AS DATE) < CAST(NEW.start_date AS DATE) THEN
        RAISE EXCEPTION 'End date cannot be before start date.';
    END IF;
    RETURN NEW;
END; $$;
CREATE TRIGGER trg_validate_leave_dates BEFORE INSERT OR UPDATE ON teacher_leaves FOR EACH ROW EXECUTE FUNCTION fn_validate_leave_dates();

-- ----------------------------------------------------------------------------
-- 4.4 NOTIFICATION TRIGGERS (Pub/Sub)
-- ----------------------------------------------------------------------------
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
