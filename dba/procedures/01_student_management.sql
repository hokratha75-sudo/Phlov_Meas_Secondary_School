-- ============================================================================
-- 01. STUDENT MANAGEMENT PROCEDURES
-- ============================================================================

-- Enroll new student
CREATE OR REPLACE PROCEDURE sp_enroll_student(
    p_student_id TEXT, p_name_kh TEXT, p_name_en TEXT, p_grade TEXT, 
    p_class_id INT, p_gender TEXT, p_enrollment_year INT, p_dob DATE, 
    p_phone TEXT, p_parent_phone TEXT, p_address TEXT
) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO students (
        student_id, name_kh, name_en, grade, class_id, gender, 
        enrollment_year, dob, phone, parent_phone, address, status, created_at, updated_at
    ) VALUES (
        p_student_id, p_name_kh, p_name_en, p_grade, p_class_id, p_gender, 
        p_enrollment_year, p_dob, p_phone, p_parent_phone, p_address, 'active', NOW(), NOW()
    );
END; $$;

-- Promote students to next grade
CREATE OR REPLACE PROCEDURE sp_promote_students(p_current_grade TEXT, p_next_grade TEXT, p_academic_year INT) LANGUAGE plpgsql AS $$
BEGIN
    UPDATE students 
    SET grade = p_next_grade, enrollment_year = p_academic_year, updated_at = NOW() 
    WHERE grade = p_current_grade AND status = 'active';
END; $$;

-- Transfer student
CREATE OR REPLACE PROCEDURE sp_transfer_student(p_student_pk INT, p_new_grade TEXT, p_new_class_id INT) LANGUAGE plpgsql AS $$
BEGIN
    UPDATE students 
    SET grade = p_new_grade, class_id = p_new_class_id, updated_at = NOW() 
    WHERE id = p_student_pk;
END; $$;

-- Graduate students
CREATE OR REPLACE PROCEDURE sp_graduate_students() LANGUAGE plpgsql AS $$
BEGIN
    UPDATE students 
    SET status = 'graduated', updated_at = NOW() 
    WHERE grade = '12' AND status = 'active';
END; $$;
