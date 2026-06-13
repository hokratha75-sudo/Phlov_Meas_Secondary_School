-- ============================================================================
-- 02. BUSINESS RULE TRIGGERS
-- ============================================================================

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
