-- ============================================================================
-- 04. LIBRARY PROCEDURES
-- ============================================================================

-- Borrow book
CREATE OR REPLACE PROCEDURE sp_borrow_book(p_student_id INT, p_book_title TEXT, p_book_code TEXT, p_due_date TIMESTAMP) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO library_logs (student_id, book_title, book_code, borrow_date, due_date, book_status, created_at, updated_at)
    VALUES (p_student_id, p_book_title, p_book_code, NOW(), p_due_date, 'borrowed', NOW(), NOW());
END; $$;

-- Return book (calculate fine if late)
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

-- Get overdue books report
CREATE OR REPLACE FUNCTION fn_overdue_books() RETURNS TABLE(student_name TEXT, book_title TEXT, days_overdue INT, fine DECIMAL) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT s.name_kh as student_name, l.book_title, EXTRACT(DAY FROM (NOW() - l.due_date))::INT as days_overdue,
           (EXTRACT(DAY FROM (NOW() - l.due_date)) * 0.50)::DECIMAL as fine
    FROM library_logs l JOIN students s ON l.student_id = s.id
    WHERE l.book_status = 'borrowed' AND l.due_date < NOW();
END; $$;
