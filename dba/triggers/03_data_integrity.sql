-- ============================================================================
-- 03. DATA INTEGRITY TRIGGERS
-- ============================================================================

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
